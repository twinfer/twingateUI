{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  buildInputs = [

    pkgs.python3
    pkgs.python3Packages.pip
    pkgs.ripgrep
    pkgs.openapi-generator-cli
    
  ];


  shellHook = ''
    # export PYTHONPATH="${pkgs.python3Packages.pip}/lib/python3.10/site-packages"
    # export PATH="${pkgs.openapi-generator-cli}/bin:$PATH"
    # export RIPGREP_CONFIG_PATH="${pkgs.ripgrep}/etc/ripgreprc"

  '';

}