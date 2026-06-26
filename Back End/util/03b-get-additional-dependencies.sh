#!/bin/bash

DIR=$( cd -- "$( dirname -- "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )

# install additional dependencies
echo "Installing additional dependencies…"
cd ${DIR}/../hscs
npm install
