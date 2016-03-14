import os
import fileinput 
os.system("ifconfig > ip.txt") 
ip_file = open("ip.txt", "r") 
ip_lines = ip_file.readlines() 
ip_address = "" 
wlan_found = False 
for ip_line in ip_lines: 	
	if wlan_found == True:
		ip_address = ip_line.split(":")[1].split(" ")[0]		
		break 

	if "wlan6" in ip_line:
		wlan_found = True 


if ip_address != "": 	
	for js_line in fileinput.input("badass.js", inplace=True):
		if "var socketaddyLocal" in js_line:
			print "var socketaddyLocal = \"ws://{0}:9001\"".format(ip_address)
		else:
			js_line = js_line.replace("\n", "")
			if len(js_line) >= 0:
				print js_line
				
ip_file.close()
os.system("rm ip.txt")
