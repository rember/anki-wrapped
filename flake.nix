{
  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    nixpkgs,
    flake-utils,
    ...
  }: flake-utils.lib.eachDefaultSystem(system:
    let
      pkgs = import nixpkgs {
        inherit system;
      };
    in
    with pkgs;
    {
      # Define a package that can be built with 'nix build', for our Docker setup
      packages.default = pkgs.buildEnv {
        name = "rember-docker";
        paths = [
          nodejs_22
          pnpm
        ];
      };

      devShells.default = mkShell {
        shellHook = ''
        '';
        buildInputs = [
          nodejs_22
          pnpm
        ];
      };
    }
  );
}
