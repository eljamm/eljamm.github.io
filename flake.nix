{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";

    treefmt-nix.url = "github:numtide/treefmt-nix";
    treefmt-nix.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs =
    { self, ... }@inputs:
    let
      inherit (inputs.flake-utils.lib)
        eachDefaultSystem
        eachDefaultSystemPassThrough
        ;

      getDefault = system: (import ./. { inherit self inputs system; });
      importFlake = arg: system: (getDefault system).flake.${arg} or { };

      # independant of system (e.g. nixosModules)
      systemAgnosticFlake = eachDefaultSystemPassThrough (importFlake "systemAgnostic");

      # depends on system (e.g. packages.x86_64-linux)
      perSystemFlake = eachDefaultSystem (importFlake "perSystem");
    in
    systemAgnosticFlake // perSystemFlake;
}
