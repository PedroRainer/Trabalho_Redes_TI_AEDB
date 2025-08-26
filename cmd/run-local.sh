#!/usr/bin/env bash

tmux new-session -d -s "redes" -n "dev"
tmux split-window -h 
tmux split-window -v -t "redes:dev.1"
tmux split-window -v -t "redes:dev.0"

tmux send-keys -t "redes:dev.0" "cd frontend && npm run dev" C-m
tmux send-keys -t "redes:dev.1" "cd views && go run ./main" C-m

tmux attach-session -t "redes" 