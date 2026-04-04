#!/usr/bin/env bash
set -euo pipefail

DOTFILES="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_HOME="${HOME}/.config"
OMZ_DIR="${HOME}/.oh-my-zsh"

if [[ ! -d "${OMZ_DIR}/.git" ]]; then
  echo "Oh My Zsh is not installed. Run ./install.sh first." >&2
  exit 1
fi

echo "Configuring dotfiles from ${DOTFILES}"

echo "Linking .gitconfig..."
ln -sf "${DOTFILES}/.gitconfig" "${HOME}/.gitconfig"

echo "Linking Oh My Zsh customizations..."
rm -rf "${OMZ_DIR}/custom"
ln -s "${DOTFILES}/zsh/custom" "${OMZ_DIR}/custom"

echo "Linking .zshrc..."
ln -sf "${DOTFILES}/zsh/.zshrc" "${HOME}/.zshrc"

echo "Linking Ghostty config..."
mkdir -p "${CONFIG_HOME}/ghostty"
ln -sf "${DOTFILES}/ghostty/config" "${CONFIG_HOME}/ghostty/config"

echo "Done."
if [[ "${SHELL:-}" != */zsh ]]; then
  echo "Optional: set zsh as default login shell: chsh -s \"$(command -v zsh)\""
fi
echo "Open a new terminal or run: exec zsh"
