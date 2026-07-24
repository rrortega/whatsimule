# Contributing to rrortega-whatsimule

First off, thank you for considering contributing to `rrortega-whatsimule`! 🎉

Contributions are what make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

---

## 🛠️ Local Development Setup

To get started with local development:

1. **Fork the Repository**: Click the "Fork" button on [GitHub](https://github.com/rrortega/whatsimule).

2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR-USERNAME/whatsimule.git
   cd whatsimule
   ```

3. **Install Dependencies**:
   This project uses `pnpm` as its package manager:
   ```bash
   pnpm install
   ```

4. **Start Development Watcher**:
   Runs `tsup` in watch mode to automatically rebuild on source changes:
   ```bash
   pnpm run dev
   ```

5. **Run Typecheck & Build Verification**:
   Before submitting changes, ensure TypeScript types compile cleanly:
   ```bash
   pnpm run typecheck
   pnpm run build
   ```

---

## 🌿 Branching Strategy & Commit Guidelines

- **Branch Naming**:
  - `feature/short-description` (for new features)
  - `fix/short-description` (for bug fixes)
  - `docs/short-description` (for documentation improvements)

- **Conventional Commits**:
  Please follow conventional commit syntax:
  - `feat: add custom wallpaper URL support`
  - `fix: correct audio waveform bar height scaling`
  - `docs: update component props table`

---

## 🔀 Submitting Pull Requests

1. Push your changes to your feature branch.
2. Open a Pull Request against the `main` branch of `rrortega/whatsimule`.
3. Provide a clear summary of your changes and reference any related issues.
4. Ensure your PR passes all type checks and builds successfully!

---

Thank you for helping make `whatsimule` better for everyone! 🚀
