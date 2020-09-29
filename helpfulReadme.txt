Maria DB (SQL)

terminal commands
sudo systemctl <action> mariadb.service  #actions can be stop, start, restart, or enable
sudo mysql_secure_installation   #removes and updates default settings that don't make sense in production ready server. Will ask you to set a default password, remove default anonymous user, prevent remote login to db, remove default task database, and reload table privleges.
mysql -u root -p    # will need sudo first time. logs into mysql with -u specifying the user (root in this case) and -p to ask for a password. use the password set up in the last step

mariadb client commands
UPDATE mysql.user SET plugin = 'mysql_native_password' WHERE user = 'root' AND plugin = 'unix_socket';       #sets it so you do not need to run sudo as part of command to log into mariadb
FLUSH PRIVILEGES;      # flushes priveleges (not sure exactly on this)


Mariadb config file (accessing it)
sudo nano /etc/mysql/mariadb.conf.d/50-server.cnf
