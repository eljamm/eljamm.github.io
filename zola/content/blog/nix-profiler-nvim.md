+++
date = 2025-06-15T22:05:00Z
description = "Instructions for setting up NeoVim to visualize the Nix evaluator's stack profile in the code."
draft = false
title = "Visualize Nix flamegraphs with NeoVim"

[extra]
keywords = "nix, flamegraph, neovim, profiling, debugging"
series = "NeoVim"
toc = true

[taxonomies]
tags = [
    "NeoVim",
    "Nix",
]
+++

A cool feature that's been recently introduced to the Nix evaluator is a [stack-sampling profiler](https://github.com/NixOS/nix/pull/13220), which can help identify and [optimize evaluation bottlenecks](https://github.com/NixOS/nixpkgs/pull/410782) by analyzing the flamegraphs it generates.

In this post, we'll go through the necessary steps to visualize this flamegraph inside NeoVim, for a more seamless experience.

{{ img(src="/images/nix-profiler.svg" alt="Nix profiler" caption="Example of a visualized flamegraph" link="<https://github.com/ngi-nix/ngipkgs/blob/4810584e62513da39b5cdee18ffb4aef4865a982/overview/default.nix#L238>") }}

# Nix profiler

## Generating a flamegraph

This feature requires a Nix version of 2.30, at least.
If you don't have that or a newer version installed, you can use:

```fish
nix run github:NixOS/nix/v2.30.1 -- --version
```

On my system, this takes about 2 minutes to build, but this may differ depending on your system resources.

Once that's done, pick something you want to analyze (derivation, NixOS system, ...) and evaluate it with the profiler.
For this post, I'm gonna use the [NGIpkgs overview](https://github.com/ngi-nix/ngipkgs/) as an example since it's something I've been recently interacted with:

```fish
nix run github:NixOS/nix/v2.30.1 -- eval \
    --no-eval-cache \
    --file ./default.nix overview \
    --option eval-profiler flamegraph
```

As a result, the flamegraph will be saved under `nix.profile` by default and we can proceed to analyzing its data.

## Visualization tools

There exist many tools that can visualize flamegraph files, but the most I like are:

1. [speedscope](https://github.com/jlfwong/speedscope)
1. [flamelens](https://github.com/YS-L/flamelens)
1. [flamegraph](https://github.com/brendangregg/FlameGraph)

Which are all available in Nixpkgs :)

Reading these graphs is simple.

{{ img(src="/images/flamelens.svg" alt="flamelens output" caption="flamelens nix.profile") }}

# NeoVim plugin

All the tools listed above are great, but re-opening the files becomes tedious pretty fast.

The plugin in question is [t-troebst/perfanno.nvim](https://github.com/t-troebst/perfanno.nvim), a lua plugin that annotates source code with profiling information.
What really caught my attention was the fact that it's language-agnostic, so I naturally wanted to try it with the Nix profiler.

## Installation

Installation is pretty straightforward. Just put this code snippet in your NeoVim config, then reload.

Here, I'm using my own fork since a fix for annotating Nix profiles is yet to be merged upstream for the plugin (although a PR is currently open in [t-troebst/perfanno.nvim · #22](https://github.com/t-troebst/perfanno.nvim/pull/22).

```lua
return {
  -- Use my fork, until the following PR is merged:
  -- https://github.com/t-troebst/perfanno.nvim/pull/23
  "eljamm/perfanno.nvim",
  branch = "fix-file-path",
  opts = {},
  -- optional, for lazy loading
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
nix run github:NixOS/nix/v2.30.1 -- eval \
    --no-eval-cache \
    --file ./default.nix overview \
    --option eval-profiler flamegraph \
    --option eval-profile-file perf.log
```

Watchexec
