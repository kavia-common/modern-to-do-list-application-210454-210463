#!/bin/bash
cd /home/kavia/workspace/code-generation/modern-to-do-list-application-210454-210463/todo_list_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

