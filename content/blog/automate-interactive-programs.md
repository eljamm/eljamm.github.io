---
title: "Automate interactive programs"
draft: true
tags:
  - automation
  - nix
---

# Introduction

We're all used to automating the boring and repetitive stuff, and we'd usually hack together some shell scripts to do so.
But what happens when the thing you want to automate is an interactive CLI tool?
Well, that's exactly the dilemma I found myself in a while ago when I wanted to do so with [[nix-init]].

## Context

I had a bunch of projects that were not packaged in [[Nixpkgs]] and `nix-init` naturally came to mind as a quick and efficient way to generate scaffolding for them. It's also particulary good for certain ecosystems like Python or Rust, which meant it was highly of generating something that worked by default.

The issue is that `nix-init` doens't have a non-interactive mode, which means you can't tell it to automatically accept the defaults and just create the [[derivation]] file.

# Prerequisite

## Keywords

- exec:
- set:
- spawn:
- expect:
- send:

## Workflow

1. `spawn` the command
1. `expect` a certain prompt to appear
1. `send` text accordingly

What about optional prompts?
What are timeouts?

# Write a simple script

```exp
#!/usr/bin/env expect

# clean up previous executions
exec sh -c "echo -n > output.json";

set timeout 360

set url_file [open "urls.txt" r]
set nixpkgs "/home/user/nixpkgs"

while {[gets $url_file url] >= 0} {
    spawn nix-shell -I nixpkgs="$nixpkgs" -p nix-init --run "nix-init -n $nixpkgs"

    expect "Enter url" { send "$url\r" }
    expect -re "Enter tag or revision.*" { send "\r" }
    expect {
        "Fetch submodules? (Y/n)" {
            send "\r"
            exp_continue
        }
        "Enter version" { send "\r" }
    }
    expect "Enter pname" { send "\r" }
    expect "How should this package be built?" { send "\r" }
    expect "Enter output path (leave as empty for the current directory)" { send "\r" }
    expect -re "Overwrite.*" { set timeout 20; send "n\r"; exp_continue }

    sleep 2
}

close $url_file
```
