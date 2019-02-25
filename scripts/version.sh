#!/usr/bin/env bash

npm list $1 | tail -n 2 | head -n 1 | sed 's/.*@//' | awk '{print $1}'
