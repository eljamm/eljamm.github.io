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
  call = default.callPackage;

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

    formatter = call ./nix/formatter.nix { };

    watch-blog = pkgs.writeShellScriptBin "watch-blog" ''
      exec ${lib.getExe pkgs.zola} \
        serve \
        --open \
        --fast
    '';

    shells.default = pkgs.mkShellNoCC {
      packages = with pkgs; [
        def.formatter.package
        def.watch-blog
        zola
      ];
    };
  });

  flake.perSystem = {
    devShells = default.shells;
    formatter = default.formatter.package;
  };
in
default
