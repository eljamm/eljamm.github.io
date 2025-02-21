{
  pkgs ? import <nixpkgs> { },
  ...
}:
let
  env = pkgs.bundlerEnv {
    name = "eljamm.github.io-bundler-env";
    inherit (pkgs) ruby;
    gemfile = ./Gemfile;
    lockfile = ./Gemfile.lock;
    gemset = ./gemset.nix;
  };
  watch-blog = pkgs.writeShellScriptBin "watch-blog" ''
    exec ${env}/bin/jekyll serve --watch
  '';
in
pkgs.mkShellNoCC {
  packages = [
    env
    watch-blog
  ];
}
