#!/bin/bash
while true; do
  cd /home/z/my-project
  PORT=3000 HOSTNAME=0.0.0.0 node .next/standalone/server.js
  echo "Server died, restarting in 2s..." >> /home/z/my-project/server.out
  sleep 2
done
