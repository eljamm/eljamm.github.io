---
title: Visualize Nix flamegraphs with NeoVim
draft: false
tags:
  - neovim
  - nix
created: 2026-04-22T23:33
modified: 2026-04-22T23:59
---

# Introduction

One of the cool feature that's been introduced to the [[Nix]] evaluator in version [2.30.0](https://github.com/NixOS/nix/releases/tag/2.30.0) is the [stack-sampling profiler](https://github.com/NixOS/nix/pull/13220), which can help [identify and optimize](https://github.com/NixOS/nixpkgs/pull/410782) evaluation bottlenecks by analyzing the [[flamegraphs]] it generates.

In this post, we'll go through the necessary steps to visualize this flamegraph inside [[NeoVim]], for a more seamless development experience.

{{ img(
  src="/static/images/nix-profiler.svg"
  alt="Nix profiler"
  caption="Example of a visualized flamegraph"
  link="<https://github.com/ngi-nix/ngipkgs/blob/4810584e62513da39b5cdee18ffb4aef4865a982/overview/default.nix#L238>"
) }}

# Nix profiler

Before we start, make sure that your Nix version is higher than `2.30.0`.
At the time of writing, the latest one is [2.33.5](https://github.com/NixOS/nix/releases/tag/2.33.5), which is tested to work with the examples we'll be seeing.

If you want to specifically use that, replace all `nix ...` commands with:

```fish
nix run github:NixOS/nix/v2.33.5 -- ...
```

## Generating a flamegraph

We can anaylze anything that the evaulator can process (derivations, NixOS systems, ...), but for the purpose of this post let's create a minimal example.
Save the following snippet to file on your system:

```nix title="default.nix"
{
  pkgs ? import <nixpkgs> { },
  lib ? pkgs.lib,
}:
let
  testPkgs = with pkgs; [
    hello
    aria2
    iperf3
    tmux
    curl
    python3
    git
    zip
  ];
in
{
  test = lib.unique testPkgs;
}
```

Then, run the following command:

```fish
nix eval \
  --no-eval-cache \
  --file ./default.nix test \
  --option eval-profiler flamegraph
```

This will evaluate the `test` attribute and generate a flamegraph under `nix.profile`.

## Visualization tools

There exist many tools that can visualize flamegraph files, but the most I like are:

1. [speedscope](https://github.com/jlfwong/speedscope)
1. [flamelens](https://github.com/YS-L/flamelens)
1. [flamegraph](https://github.com/brendangregg/FlameGraph)

Which are all available in Nixpkgs :)

Reading these graphs is simple.

{{ img(
  src="/static/images/flamelens.svg"
  alt="flamelens output"
  caption="flamelens nix.profile"
) }}

# NeoVim plugin

All the tools listed above are great, but re-opening the files becomes tedious pretty fast.

The plugin in question is [t-troebst/perfanno.nvim](https://github.com/t-troebst/perfanno.nvim), a lua plugin that annotates source code with profiling information.
What really caught my attention was the fact that it's language-agnostic, so I naturally wanted to try it with the Nix profiler.

## Installation

Installation is pretty straightforward. Just put this code snippet in your NeoVim config, then reload.

Here, I'm using my own fork since a fix for annotating Nix profiles is yet to be merged upstream for the plugin (although a PR is currently open in [t-troebst/perfanno.nvim · #22](https://github.com/t-troebst/perfanno.nvim/pull/22).

```lua
return {
    "t-troebst/perfanno.nvim",
    opts = {},
    keys = {
        { "<leader>plf", "<CMD>PerfLoadFlat<CR>", desc = "Load Flat Profile" },
        { "<leader>plg", "<CMD>PerfLoadCallGraph<CR>", desc = "Load Call Graph" },
        { "<leader>plo", "<CMD>PerfLoadFlameGraph<CR>", desc = "Load Flame Graph" },
        { "<leader>pe", "<CMD>PerfPickEvent<CR>", desc = "Pick Event" },
        { "<leader>pa", "<CMD>PerfAnnotate<CR>", desc = "Annotate" },
        { "<leader>pf", "<CMD>PerfAnnotateFunction<CR>", desc = "Annotate Function" },
        { "<leader>pa", "<CMD>PerfAnnotateSelection<CR>", mode = "v", desc = "Annotate Selection" },
        { "<leader>pt", "<CMD>PerfToggleAnnotations<CR>", desc = "Toggle Annotations" },
        { "<leader>ph", "<CMD>PerfHottestLines<CR>", desc = "Hottest Lines" },
        { "<leader>ps", "<CMD>PerfHottestSymbols<CR>", desc = "Hottest Symbols" },
        { "<leader>pc", "<CMD>PerfHottestCallersFunction<CR>", desc = "Hottest Callers Function" },
        { "<leader>pc", "<CMD>PerfHottestCallersSelection<CR>", mode = "v", desc = "Hottest Callers Selection" },
    },
}
```

## Usage

The plugin expects the file to be under `perf.log`, by default, but will ask you for the file path if it can't find it.

```fish
nix run github:NixOS/nix/v2.33.5 -- eval \
    --no-eval-cache \
    --file ./default.nix overview \
    --option eval-profiler flamegraph \
    --option eval-profile-file perf.log
```

Watchexec
