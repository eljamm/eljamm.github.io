with (import <nixpkgs> { });
let
  env = bundlerEnv {
    name = "eljamm.github.io-bundler-env";
    inherit ruby;
    gemfile = ./Gemfile;
    lockfile = ./Gemfile.lock;
    gemset = ./gemset.nix;
  };
in
stdenv.mkDerivation {
  name = "eljamm.github.io";
  buildInputs = [ env bundix ];
}
