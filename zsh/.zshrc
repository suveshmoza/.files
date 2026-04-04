#* 1. Powerlevel10k Instant Prompt (MUST BE FIRST)
if [[ -r "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh" ]]; then
  source "${XDG_CACHE_HOME:-$HOME/.cache}/p10k-instant-prompt-${(%):-%n}.zsh"
fi

#* 2. Oh-My-Zsh Setup
export ZSH="$HOME/.oh-my-zsh"
ZSH_THEME="powerlevel10k/powerlevel10k"

plugins=(zsh-autosuggestions zsh-syntax-highlighting web-search)
source "$ZSH/oh-my-zsh.sh"

#* 3. Powerlevel10k Main Config
[[ ! -f ~/.p10k.zsh ]] || source ~/.p10k.zsh

#* 4. PATH & Toolchains

#* Google Cloud SDK (wrapped to prevent I/O)
() {
  local SDK="$HOME/Downloads/google-cloud-sdk"
  [ -f "$SDK/path.zsh.inc" ] && . "$SDK/path.zsh.inc"
  [ -f "$SDK/completion.zsh.inc" ] && . "$SDK/completion.zsh.inc"
}

#* pnpm
export PNPM_HOME="$HOME/Library/pnpm"
case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac

#* pipx
export PATH="$PATH:$HOME/.local/bin"

#* ngrok autocompletion (wrapped)
() {
  if command -v ngrok &>/dev/null; then
    eval "$(ngrok completion)"
  fi
}

#* Android SDK
export ANDROID_HOME="$HOME/Library/Android/sdk"
export PATH="$PATH:$ANDROID_HOME/emulator"
export PATH="$PATH:$ANDROID_HOME/platform-tools"
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin"
export PATH="$PATH:$ANDROID_HOME/tools/bin"

#* Android Studio
export PATH="$PATH:/Applications/Android Studio.app/Contents/MacOS"

#* Bun
export BUN_INSTALL="$HOME/.bun"
export PATH="$BUN_INSTALL/bin:$PATH"

#* Java
export JAVA_HOME="/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home"


#* Ruby (Homebrew)
export PATH="/opt/homebrew/opt/ruby@3.3/bin:$PATH"

#* direnv (WRAPPED TO PREVENT EARLY I/O)
() {
  emulate -L zsh
  export DIRENV_LOG_FORMAT=""
  eval "$(direnv hook zsh)"
}
#* Antigravity
export PATH="$HOME/.antigravity/antigravity/bin:$PATH"

#* bun completions
[ -s "$HOME/.bun/_bun" ] && source "$HOME/.bun/_bun"

#* LM Studio CLI (lms)
export PATH="$PATH:$HOME/.lmstudio/bin"

