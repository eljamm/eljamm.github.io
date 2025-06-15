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

In this post, we will go through the necessary steps to visualize flamegraphs inside NeoVim.

{{ img(src="/images/nix-profiler.svg" alt="Nix profiler" link="<https://github.com/ngi-nix/ngipkgs/blob/4810584e62513da39b5cdee18ffb4aef4865a982/overview/default.nix#L238>") }}

# Nix profiler

## Generating a flamegraph

Although this feature has been merged in [NixOS/nix · #13220](https://github.com/NixOS/nix/pull/13220), it has yet to reach a stable Nix release and might take a while before that happens. This means that we'll need to use a pinned Nix version that does support it:

```fish
nix run github:NixOS/nix/4cc312a6e1911220b3c913c3d5f40f8dbf448a4a -- eval \
    --no-eval-cache \
    --file ./default.nix overview \
    --option eval-profiler flamegraph
```

The flamegraph will be saved under `nix.profile`, by default.

> [!NOTE]
> Nix might take some time to build, depending on your system resources, so go get yourself something to drink in the meantime ☕

## Visualization

The result file is like any flamegraph and can be visualized with normal tools like:

1. [speedscope](https://github.com/jlfwong/speedscope/issues)
1. [flamelens](https://github.com/YS-L/flamelens)
1. [flamegraph](https://github.com/brendangregg/FlameGraph)

Which are all available in Nixpkgs :)

# NeoVim plugin

The plugin in question is [t-troebst/perfanno.nvim](https://github.com/t-troebst/perfanno.nvim), a lua plugin that annotates source code with profiling information. What really caught my attention was the fact that it's language-agnostic, so I naturally wanted to try it with the Nix profiler.

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
nix run github:NixOS/nix/4cc312a6e1911220b3c913c3d5f40f8dbf448a4a -- eval \
    --no-eval-cache \
    --file ./default.nix overview \
    --option eval-profiler flamegraph
```

Watchexec
