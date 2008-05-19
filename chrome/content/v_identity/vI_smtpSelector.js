/* ***** BEGIN LICENSE BLOCK *****
    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA

    The Original Code is the Virtual Identity Extension.

    The Initial Developer of the Original Code is Rene Ejury.
    Portions created by the Initial Developer are Copyright (C) 2007
    the Initial Developer. All Rights Reserved.

    Contributor(s):
 * ***** END LICENSE BLOCK ***** */

var vI_smtpSelector = {
	smtpService : Components.classes["@mozilla.org/messengercompose/smtp;1"]
					.getService(Components.interfaces.nsISmtpService),
	
	prefroot : Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch(null).QueryInterface(Components.interfaces.nsIPrefBranch2),
	
	elements : {
		Area_SMTPServerList : null,
		Obj_SMTPServerList : null,
		Obj_SMTPServerListPopup : null
	},
	
	init : function() {
		// only do this once
		if (!vI_smtpSelector.elements.Area_SMTPServerList) {
			vI_smtpSelector.elements.Area_SMTPServerList = document.getElementById("smtpServerListHbox");
			vI_smtpSelector.elements.Obj_SMTPServerList = document.getElementById("smtp_server_list");
			vI_smtpSelector.elements.Obj_SMTPServerListPopup = document.getElementById("smtp_server_list_popup");
			vI_smtpSelector.addObserver();
		}
		vI_smtpSelector.__loadSMTP_server_list();
		vI_smtpSelector.__selectUsedSMTPServer();
		vI_smtpSelector.observe(); // just do it once to initialize the status
	},
	
	clean : function() {
		vI_notificationBar.dump("## v_smtpSelector: clean\n")
		MenuItems = vI_smtpSelector.elements.Obj_SMTPServerListPopup.childNodes
		while (MenuItems.length > 0) vI_smtpSelector.elements.Obj_SMTPServerListPopup.removeChild(MenuItems[0])
	},

	observe: function() {
		vI_smtpSelector.elements.Area_SMTPServerList.setAttribute("hidden",
			!vI.preferences.getBoolPref("show_smtp"));
	},
	
	addObserver: function() {
		vI_smtpSelector.prefroot.addObserver("extensions.virtualIdentity.show_smtp", vI_smtpSelector, false);
	},
	
	removeObserver: function() {
		vI_smtpSelector.prefroot.removeObserver("extensions.virtualIdentity.show_smtp", vI_smtpSelector);
	},

	loadSMTP : function()
	{
		vI_msgIdentityClone.inputEvent(); // any change of the menu is handled by vI_msgIdentityClone
	},
	
	resetMenuToMsgIdentity : function(identitykey) {
		if (!identitykey) return;
		var smtpKey = gAccountManager.getIdentity(identitykey).smtpServerKey
		if (!smtpKey) for (var i in gAccountManager.accounts) {
				for (var j in gAccountManager.accounts[i].identities) {
					if (identitykey == gAccountManager.accounts[i].identities[j].key)
						smtpKey = gAccountManager.accounts[i].defaultIdentity.smtpServerKey;
				}
			}
		vI_smtpSelector.setMenuToKey(smtpKey);
	},
	
	setMenuToKey : function (smtpKey) {
		if (!smtpKey) smtpKey = "";
		vI_notificationBar.dump("## v_smtpSelector: setMenuToKey '" + smtpKey + "'\n")
		MenuItems = vI_smtpSelector.elements.Obj_SMTPServerListPopup.childNodes
		for (index = 0; index < MenuItems.length; index++) {
			if (MenuItems[index].localName == "menuseparator") continue;
			//~ vI_notificationBar.dump("## v_smtpSelector: compare with '" + MenuItems[index].getAttribute("key") + "'\n")
			if (MenuItems[index].getAttribute("key") == smtpKey) {
				//~ vI_notificationBar.dump("## v_smtpSelector: use SMTP " + MenuItems[index].label + "\n")
				vI_smtpSelector.elements.Obj_SMTPServerList.selectedItem =
					MenuItems[index];
				break;
			}
		}
	},
	
	__selectUsedSMTPServer : function() {
		vI_notificationBar.dump("## v_smtpSelector: __selectUsedSMTPServer\n")
		if (vI_helper.getBaseIdentity().smtpServerKey) {
			//~ vI_notificationBar.dump("## v_smtpSelector: __selectUsedSMTPServer if\n")
			vI_smtpSelector.setMenuToKey(vI_helper.getBaseIdentity().smtpServerKey)
			vI_notificationBar.dump("## v_smtpSelector: use SMTP from BaseIdentity: " + vI_helper.getBaseIdentity().smtpServerKey + "\n")
			}
		else {
			//~ vI_notificationBar.dump("## v_smtpSelector: __selectUsedSMTPServer else\n")
			// find the account related to the identity, to get the account-related default smtp, if it exists.
			var accounts = queryISupportsArray(gAccountManager.accounts, Components.interfaces.nsIMsgAccount);
			
			if (typeof(sortAccounts)=="function") // TB 3.x
				accounts.sort(sortAccounts);
			else if (typeof(compareAccountSortOrder)=="function") // TB 2.x
				accounts.sort(compareAccountSortOrder);
			
			for (var x in accounts) {
				vI_notificationBar.dump(".")
				
				var identities = queryISupportsArray(accounts[x].identities, Components.interfaces.nsIMsgIdentity);
				for (var j in identities) {
					vI_notificationBar.dump("_")
					var identity = identities[j];
					if (identity.key == vI_helper.getBaseIdentity().key) {
						if (accounts[x].defaultIdentity.smtpServerKey) {
							vI_notificationBar.dump("## v_smtpSelector: use SMTP from Account of BaseIdentity: " +
								accounts[x].defaultIdentity.smtpServerKey + "\n")
							vI_smtpSelector.setMenuToKey(accounts[x].defaultIdentity.smtpServerKey)
						}
						return;
					}
				}
			}
		}
		//~ vI_notificationBar.dump("## v_smtpSelector: __selectUsedSMTPServer finished\n")
	},
	
	__loadSMTP_server_list : function()
	{
		var listitem = vI_smtpSelector.__createDefaultSmtpListItem();
		vI_smtpSelector.elements.Obj_SMTPServerListPopup.appendChild(listitem);
		vI_smtpSelector.elements.Obj_SMTPServerList.selectedItem = listitem;

		var separator = document.createElement("menuseparator");
		vI_smtpSelector.elements.Obj_SMTPServerListPopup.appendChild(separator);

		var servers = vI_smtpSelector.smtpService.smtpServers;
		
		function addServer (server) {
			if (server instanceof Components.interfaces.nsISmtpServer &&
        !server.redirectorType) {
				var listitem = vI_smtpSelector.__createSmtpListItem(server);
				vI_smtpSelector.elements.Obj_SMTPServerListPopup.appendChild(listitem);
			}
		}
		
		if (typeof(servers.Count) == "undefined")		// TB 3.x
			while (servers && servers.hasMoreElements())
				addServer(servers.getNext());
		else							// TB 2.x
			for (var i=0 ; i<servers.Count(); i++)
				addServer(servers.QueryElementAt(i, Components.interfaces.nsISmtpServer));
	},
	
	__createDefaultSmtpListItem : function () {
	    var listitem = document.createElement("menuitem");
	    listitem.setAttribute("label", document.getElementById("bundle_messenger").getString("defaultServerTag"));
	    return listitem;	
	},
	
	__createSmtpListItem : function (server) {
	    var listitem = document.createElement("menuitem");
	    listitem.setAttribute("label", (server.description?server.description:server.hostname));
	    listitem.setAttribute("key", server.key);
	    return listitem;
	}
}
window.addEventListener("unload", function(e) { try {vI_smtpSelector.removeObserver();} catch (ex) { } }, false);