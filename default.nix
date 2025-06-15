let
  flake-inputs = import (
    fetchTarball "https://github.com/fricklerhandwerk/flake-inputs/tarball/4.1.0"
  );
  inherit (flake-inputs)
    import-flake
    ;
in
{
  self ? import-flake {
    src = ./.;
  },
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
  args = {
    inherit
      lib
      pkgs
      self
      system
      inputs
      ;
    inherit (default)
      packages
      ;
    devShells = default.shells;
  };

  formatter = import ./dev/formatter.nix args;

  # To update `./gemset.nix`, run:
  # - `bundle lock --update`
  # - `bundix -l`
  # - reload nix-shell
  env = pkgs.bundlerEnv {
    name = "eljamm.github.io-bundler-env";
    inherit (pkgs) ruby;
    gemfile = ./Gemfile;
    lockfile = ./Gemfile.lock;
    gemset = ./gemset.nix;
  };

  watch-blog = pkgs.writeShellScriptBin "watch-blog" ''
    exec ${env}/bin/jekyll \
      serve \
      --watch \
      --livereload \
      --incremental
  '';

  default = rec {
    packages = { };

    shells.default = pkgs.mkShellNoCC {
      packages = [
        env
        formatter
        watch-blog
      ];
    };

    flake.packages = lib.filterAttrs (n: v: lib.isDerivation v) packages;
    flake.devShells = shells;
    flake.formatter = formatter;
  };
in
default // args
