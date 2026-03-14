{
  flake-inputs ? import (fetchTarball {
    url = "https://github.com/fricklerhandwerk/flake-inputs/tarball/4.1.0";
    sha256 = "1j57avx2mqjnhrsgq3xl7ih8v7bdhz1kj3min6364f486ys048bm";
  }),
  self ? flake-inputs.import-flake { src = ./.; },
  inputs ? self.inputs,
  system ? builtins.currentSystem,
  pkgs ? import inputs.nixpkgs {
    config = { };
    overlays = [ ];
    inherit system;
  },
  lib ? import "${inputs.nixpkgs}/lib",
}:
let
  default = lib.makeScope pkgs.newScope (def: {
    inherit
      lib
      pkgs
      self
      system
      inputs
      flake
      default # recurse scope
      ;

    # Custom library. Contains helper functions, builders, ...
    devLib = def.callPackage ./nix/lib.nix { };

    devPkgs = { };

    formatter = def.callPackage ./nix/formatter.nix { };
    shells = def.callPackage ./nix/shells.nix { };

    overlays.default = final: prev: def.devPkgs;
  });

  flake = default.callPackage ./nix/flake { };

  # return final scope, with computed and non-recursive attributes
  finalScope = default.packages default;
in
finalScope
