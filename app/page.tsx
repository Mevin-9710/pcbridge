"use client";

import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      <nav className="glass-strong sticky top-0 z-50 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="text-lg font-semibold gradient-text">PCBridge</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/connect-pc" className="text-sm text-[#a3a3a3] hover:text-white transition-colors">
              Connect
            </Link>
            <Link href="/dashboard" className="btn-secondary text-sm !py-2 !px-4">
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <section className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8">
            <span className="status-dot status-online" />
            <span className="text-sm text-[#a3a3a3]">MCP Bridge for AI Chatbots</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="gradient-text">Use Your Computer</span>
            <br />
            <span className="text-white">Like a Coding Agent</span>
          </h1>

          <p className="text-xl text-[#a3a3a3] mb-12 max-w-2xl mx-auto leading-relaxed">
            PCBridge lets ChatGPT, Claude, Gemini, and other compatible chatbots
            execute code, edit files, run commands, and use Git on your computer —
            all through a secure MCP connection.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link href="/connect-pc" className="btn-primary text-lg !px-8 !py-4">
              Get Started
            </Link>
            <a
              href="https://github.com/Mevin-9710/pcbridge"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary text-lg !px-8 !py-4"
            >
              View on GitHub
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card text-left">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                  <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Secure by Design</h3>
              <p className="text-sm text-[#a3a3a3]">
                Token-based pairing, configurable approval for destructive operations, and all execution stays on your machine.
              </p>
            </div>

            <div className="card text-left">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M4 17l6-6-6-6M12 19h8" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Full Coding Agent</h3>
              <p className="text-sm text-[#a3a3a3]">
                File editing, terminal commands, Git operations, debugging, testing, and multi-step coding tasks.
              </p>
            </div>

            <div className="card text-left">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-teal-500 flex items-center justify-center mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">MCP Native</h3>
              <p className="text-sm text-[#a3a3a3]">
                Works with any MCP-compatible chatbot — ChatGPT, Claude, Gemini, and more. No plugins needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="glass-subtle px-6 py-8 text-center">
        <p className="text-sm text-[#a3a3a3]">
          Open source under MIT License —{" "}
          <a href="https://github.com/Mevin-9710/pcbridge" className="text-indigo-400 hover:text-indigo-300">
            GitHub
          </a>
        </p>
      </footer>
    </main>
  );
}
