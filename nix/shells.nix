{
  pkgs,
  formatter,
  ...
}:
{
  default = pkgs.mkShellNoCC {
    inputsFrom = [
      formatter.shell
    ];
    packages = with pkgs; [
      formatter.package
      gitMinimal
      nodejs_24
    ];
    shellHook = ''
      export PROJECT_ROOT="$(git rev-parse --show-toplevel)"

      # better compat with IDEs
      ln -sf \
        "${formatter.configFile}" \
        "$PROJECT_ROOT/treefmt.toml"
    '';
  };
}
