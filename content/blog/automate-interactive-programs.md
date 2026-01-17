+++
date = 2025-10-15T22:38:00Z
description = "Basic usage of the `expect` command to automate interactive programs."
draft = true
title = "Automate interactive programs"

[extra]
keywords = "nix, automation"
series = ""
toc = true

[taxonomies]
tags = [
    "Automation",
    "Nix",
]
+++

Sometimes in life you want to automate some tool that don't have any other way to be interacted with than interactively. I'm sure there are different ways to do this, but I've recently discovered the `expect` tool, which has been designed to do this.

# Context

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
set nixpkgs "/home/kuroko/nixpkgs"

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

> **Note:** I had to create [custom highlighting](https://www.sublimetext.com/docs/syntax.html) for expect, specifically for this article ;)
