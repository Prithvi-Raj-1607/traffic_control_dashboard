#!/bin/bash
(
  cd /home/z/my-project
  export PORT=3000
  export HOSTNAME=0.0.0.0
  exec node .next/standalone/server.js >> /home/z/my-project/server.out 2>> /home/z/my-project/server.err
) &
