#!/usr/bin/env bash
set -euo pipefail

PCBRIDGE_VERSION="0.1.0"
PCBRIDGE_API_URL="https://pcbridge.vercel.app"
INSTALL_DIR="${HOME}/.pcbridge"
RUNNER_DIR="${INSTALL_DIR}/runner"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

detect_os() {
    local os
    os=$(uname -s)
    case "$os" in
        Linux*)     echo "linux" ;;
        Darwin*)    echo "macos" ;;
        CYGWIN*|MINGW*|MSYS*) echo "windows" ;;
        *)          echo "unknown" ;;
    esac
}

detect_distro() {
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        echo "$ID"
    else
        echo "unknown"
    fi
}

install_node_linux() {
    local distro
    distro=$(detect_distro)

    log_info "Installing Node.js on $distro..."

    case "$distro" in
        ubuntu|debian|pop)
            curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
            sudo apt-get install -y nodejs
            ;;
        fedora|rhel|centos)
            curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
            sudo dnf install -y nodejs
            ;;
        arch|manjaro|endeavouros)
            sudo pacman -S --noconfirm nodejs npm
            ;;
        alpine)
            sudo apk add --no-cache nodejs npm
            ;;
        *)
            log_warn "Unknown distribution. Please install Node.js 20+ manually."
            log_info "Visit: https://nodejs.org/en/download"
            return 1
            ;;
    esac
}

install_node_macos() {
    if command -v brew &> /dev/null; then
        log_info "Installing Node.js via Homebrew..."
        brew install node@20
    else
        log_warn "Homebrew not found. Please install Node.js 20+ manually."
        log_info "Visit: https://nodejs.org/en/download"
        return 1
    fi
}

install_node() {
    if command -v node &> /dev/null; then
        local version
        version=$(node --version | sed 's/v//' | cut -d. -f1)
        if [ "$version" -ge 20 ]; then
            log_success "Node.js $(node --version) already installed"
            return 0
        else
            log_warn "Node.js version is too old ($(node --version)). Need 20+."
        fi
    fi

    local os
    os=$(detect_os)

    case "$os" in
        linux)  install_node_linux ;;
        macos)  install_node_macos ;;
        windows)
            log_warn "Please install Node.js 20+ manually."
            log_info "Visit: https://nodejs.org/en/download"
            return 1
            ;;
        *)
            log_error "Unsupported operating system: $os"
            return 1
            ;;
    esac
}

install_runner() {
    log_info "Installing PCBridge runner..."

    mkdir -p "$RUNNER_DIR"

    log_info "Downloading runner package..."

    local arch
    arch=$(uname -m)
    local platform
    platform=$(detect_os)

    local download_url
    case "$platform" in
        linux)
            case "$arch" in
                x86_64)  download_url="${PCBRIDGE_API_URL}/releases/download/v${PCBRIDGE_VERSION}/pcbridge-runner-linux-x64.tar.gz" ;;
                aarch64) download_url="${PCBRIDGE_API_URL}/releases/download/v${PCBRIDGE_VERSION}/pcbridge-runner-linux-arm64.tar.gz" ;;
                *)       download_url="${PCBRIDGE_API_URL}/releases/download/v${PCBRIDGE_VERSION}/pcbridge-runner-linux-x64.tar.gz" ;;
            esac
            ;;
        macos)
            case "$arch" in
                x86_64)  download_url="${PCBRIDGE_API_URL}/releases/download/v${PCBRIDGE_VERSION}/pcbridge-runner-macos-x64.tar.gz" ;;
                arm64)   download_url="${PCBRIDGE_API_URL}/releases/download/v${PCBRIDGE_VERSION}/pcbridge-runner-macos-arm64.tar.gz" ;;
                *)       download_url="${PCBRIDGE_API_URL}/releases/download/v${PCBRIDGE_VERSION}/pcbridge-runner-macos-x64.tar.gz" ;;
            esac
            ;;
        *)
            download_url="${PCBRIDGE_API_URL}/releases/download/v${PCBRIDGE_VERSION}/pcbridge-runner-linux-x64.tar.gz"
            ;;
    esac

    local temp_dir
    temp_dir=$(mktemp -d)

    if command -v curl &> /dev/null; then
        curl -fsSL "$download_url" -o "${temp_dir}/runner.tar.gz"
    elif command -v wget &> /dev/null; then
        wget -q "$download_url" -O "${temp_dir}/runner.tar.gz"
    else
        log_error "Neither curl nor wget is available. Please install one of them."
        rm -rf "$temp_dir"
        return 1
    fi

    tar -xzf "${temp_dir}/runner.tar.gz" -C "$RUNNER_DIR"
    rm -rf "$temp_dir"

    chmod +x "${RUNNER_DIR}/pcbridge"

    log_success "Runner installed to $RUNNER_DIR"
}

create_launcher() {
    log_info "Creating launcher script..."

    local bin_dir="${HOME}/.local/bin"
    mkdir -p "$bin_dir"

    cat > "${bin_dir}/pcbridge" << 'EOF'
#!/usr/bin/env bash
exec "${HOME}/.pcbridge/runner/pcbridge" "$@"
EOF

    chmod +x "${bin_dir}/pcbridge"

    if [[ ":$PATH:" != *":${bin_dir}:"* ]]; then
        log_warn "Please add ${bin_dir} to your PATH:"
        echo "  echo 'export PATH=\"${bin_dir}:\$PATH\"' >> ~/.bashrc"
        echo "  source ~/.bashrc"
    fi

    log_success "Launcher created at ${bin_dir}/pcbridge"
}

print_next_steps() {
    echo
    echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                  PCBridge is ready!                       ║${NC}"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
    echo
    echo -e "${BLUE}Next steps:${NC}"
    echo
    echo "  1. Go to https://pcbridge.vercel.app/dashboard"
    echo "  2. Click 'Generate Code' to get a pairing code"
    echo "  3. Run the following command to start PCBridge:"
    echo
    echo -e "     ${YELLOW}pcbridge start --code XXXXXX${NC}"
    echo
    echo "  4. Your computer will appear in the dashboard as connected"
    echo "  5. Add the MCP configuration to your chatbot:"
    echo
    echo '     {'
    echo '       "mcpServers": {'
    echo '         "pcbridge": {'
    echo '           "url": "https://pcbridge.vercel.app/api/mcp",'
    echo '           "headers": {'
    echo '             "X-Device-Id": "YOUR_DEVICE_ID"'
    echo '           }'
    echo '         }'
    echo '       }'
    echo '     }'
    echo
    echo -e "${BLUE}Documentation:${NC}"
    echo "  Setup guide:  https://pcbridge.vercel.app/connect-pc"
    echo "  GitHub:       https://github.com/Mevin-9710/pcbridge"
    echo
}

main() {
    echo
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║              PCBridge Setup v${PCBRIDGE_VERSION}                      ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
    echo

    local os
    os=$(detect_os)
    log_info "Detected OS: $os"

    if [ "$os" = "unknown" ]; then
        log_error "Could not detect operating system"
        exit 1
    fi

    install_node
    install_runner
    create_launcher
    print_next_steps
}

main "$@"
