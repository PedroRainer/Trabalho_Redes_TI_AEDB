#!/usr/bin/env bash
# Run projeto Redes em tmux com logs do Go em destaque + arquivo
set -Eeuo pipefail

SESSION="${SESSION:-redes}"
WINDOW="${WINDOW:-dev}"
LOG_DIR="${LOG_DIR:-logs}"
ZOOM_GO="${ZOOM_GO:-1}"   # 1 = abre já em tela cheia no pane do Go; 0 = lado a lado

# Comandos
GO_CMD='cd cmd/views && if command -v air >/dev/null 2>&1; then echo "▶ Go com air"; air; else echo "▶ Go com go run"; go run ./main; fi'
WEB_CMD='cd cmd/frontend && ( [ -d node_modules ] || npm i ) && npm run dev'

# Checagens
command -v tmux >/dev/null 2>&1 || { echo "tmux não encontrado. Instale com: sudo apt install tmux"; exit 1; }
mkdir -p "$LOG_DIR"

# Se já existe, só anexa e foca o Go
if tmux has-session -t "$SESSION" 2>/dev/null; then
  tmux select-window -t "$SESSION:$WINDOW" 2>/dev/null || true
  tmux select-pane -t "$SESSION:$WINDOW".0 2>/dev/null || true
  [ "$ZOOM_GO" = "1" ] && tmux resize-pane -Z -t "$SESSION:$WINDOW".0 2>/dev/null || true
  exec tmux attach -t "$SESSION"
fi

# Cria sessão e janela
tmux new-session -d -s "$SESSION" -n "$WINDOW"

# Pane 0 (esquerda): Go
tmux send-keys -t "$SESSION:$WINDOW".0 "$GO_CMD" C-m

# Ativa pipe dos logs do Go (timestamp + grava em arquivo)
# Obs: 'pipe-pane' não altera a visualização do pane; só duplica a saída pro comando.
tmux pipe-pane -o -t "$SESSION:$WINDOW".0 "awk '{ print strftime(\"[%H:%M:%S]\"), \$0 }' | tee -a '$LOG_DIR/go-$(date +%F).log'"

# Pane 1 (direita): Next
tmux split-window -h -t "$SESSION:$WINDOW".0
tmux send-keys -t "$SESSION:$WINDOW".1 "$WEB_CMD" C-m

# Deixa o Go em foco e, se quiser, maximiza (toggle com Ctrl-b z)
tmux select-pane -t "$SESSION:$WINDOW".0
[ "$ZOOM_GO" = "1" ] && tmux resize-pane -Z -t "$SESSION:$WINDOW".0

# Dica: mais espaço pro Go quando não estiver em zoom (ajuste o 999/percentual conforme tela)
# tmux resize-pane -t "$SESSION:$WINDOW".0 -R 999

tmux attach -t "$SESSION"
