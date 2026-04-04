#!/usr/bin/env bash
set -euo pipefail

DOTFILES="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OMZ_DIR="${HOME}/.oh-my-zsh"
CUSTOM_DIR="${DOTFILES}/zsh/custom"

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "This bootstrap script targets macOS only." >&2
  exit 1
fi

ensure_brew_in_path() {
  if command -v brew >/dev/null 2>&1; then
    return
  fi
  if [[ -x /opt/homebrew/bin/brew ]]; then
    eval "$(/opt/homebrew/bin/brew shellenv)"
  elif [[ -x /usr/local/bin/brew ]]; then
    eval "$(/usr/local/bin/brew shellenv)"
  fi
}

if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew not found. Installing (non-interactive)..."
  NONINTERACTIVE=1 /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

ensure_brew_in_path

if ! command -v brew >/dev/null 2>&1; then
  echo "Homebrew is installed but not on PATH. Add brew to your PATH, then re-run." >&2
  echo "Try: eval \"\$(/opt/homebrew/bin/brew shellenv)\"   (Apple Silicon)" >&2
  echo "  or: eval \"\$(/usr/local/bin/brew shellenv)\"     (Intel)" >&2
  exit 1
fi

echo "Running brew bundle..."
brew bundle --file="${DOTFILES}/Brewfile" --no-lock

if [[ ! -d "${OMZ_DIR}/.git" ]]; then
  echo "Installing Oh My Zsh..."
  rm -rf "${OMZ_DIR}"
  git clone --depth=1 https://github.com/ohmyzsh/ohmyzsh.git "${OMZ_DIR}"
else
  echo "Oh My Zsh already present at ${OMZ_DIR}"
fi

mkdir -p "${CUSTOM_DIR}/themes" "${CUSTOM_DIR}/plugins"

clone_shallow() {
  local url="$1" dest="$2"
  if [[ -d "${dest}/.git" ]]; then
    echo "Already present: ${dest}"
    return
  fi
  rm -rf "${dest}"
  git clone --depth=1 "${url}" "${dest}"
}

clone_shallow https://github.com/romkatv/powerlevel10k.git "${CUSTOM_DIR}/themes/powerlevel10k"
clone_shallow https://github.com/zsh-users/zsh-autosuggestions "${CUSTOM_DIR}/plugins/zsh-autosuggestions"
clone_shallow https://github.com/zsh-users/zsh-syntax-highlighting.git "${CUSTOM_DIR}/plugins/zsh-syntax-highlighting"

echo "Bootstrap done. Next: ./configure.sh"
