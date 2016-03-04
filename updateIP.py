import os
import fileinput

os.system("ifconfig > ip.txt")

ip_file = open("ip.txt", "r")

ip_lines = ip_file.readlines()

ip_address = ""

wlan_found = False

for line in ip_lines:

	if wlan_found == True:
		ip_address = line.split(":")[1].split(" ")[0]
		
		break
	if "wlan0" in line:
		wlan_found = True

if ip_address != "":

	for line in fileinput.input("badass.js", inplace=True):
	    if "var socketaddyLocal" in line:
	    	print "var socketaddyLocal = \"ws://{0}:9001\"".format(ip_address)
	    else:
	    	print line
ip_file.close()
os.system("rm ip.txt")