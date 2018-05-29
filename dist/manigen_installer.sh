#DECLARE VARS
    #NAMES AND PATHS
	name=manigen.iti.sidi
	vscode_ext_dir=$HOME/.vscode/extensions

    #ALERTS
	msg_installed='Manigen Extension Successfully Installed.'
	msg_dir_not_found="Directory ${vscode_ext_dir} not exists!"
	msg_package_not_found="Setup did not find any version on ${name} to install."

    # CHECK PACKAGES AVALABILITY
	num_pkgs=`ls -td $name-*.tar.gz | wc -l`
	if [ "$num_pkgs" -gt 0 ];then	
	    
	   # GET LAST VERSION
		version=`ls -td $name-*.tar.gz |sort -r |head -1 | cut -d '-' -f 2 | cut -d "t" -f 1`
		package_name="${name}-${version}tar.gz"
		echo "$(tput setaf 2) $(tput setab 7) LAST PACKAGE VERSION ${package_name} $(tput sgr 0)"
	
	    #STATE MANAGEMENT 
		#[IMPLEMENT IN FUTURE VERSIONS]

            #REMOVE OLD VERSIONS [CURRENTLY REMOVE ALL INSTALED VERSIONS]
	    	rm -rf $vscode_ext_dir/$name-*

	    # INSTALATION
		if [ -d "$vscode_ext_dir" ]; then
			tar -xzf $package_name --directory $vscode_ext_dir
			echo "$(tput setaf 2) $(tput setab 7) ${msg_installed} $(tput sgr 0)"
		else
			mkdir -p $vscode_ext_dir
			tar -xzf $package_name --directory $vscode_ext_dir
		fi
	else
		echo "$(tput setaf 1) $(tput setab 7) ${msg_package_not_found} $(tput sgr 0)"
	fi


