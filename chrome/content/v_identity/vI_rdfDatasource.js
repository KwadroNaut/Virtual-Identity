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
 
vI_rdfDatasource = {			
	rdfService : Components.classes["@mozilla.org/rdf/rdf-service;1"]
			.getService(Components.interfaces.nsIRDFService),
	
	rdfDataSource : null,
	rdfFileName : "virtualIdentity.rdf",
	rdfNS : "http://virtual-id.absorb.it/",
	rdfNSEmail : "vIStorage/email/",
	rdfNSMaillist : "vIStorage/maillist/",
	rdfNSNewsgroup : "vIStorage/newsgroup/",
	
	extensionManager : Components.classes["@mozilla.org/extensions/manager;1"]
			.getService(Components.interfaces.nsIExtensionManager),
	
	rdfVersion : "0.0.1",	// version of current implemented RDF-schema, internal only to trigger updates
	
	virtualIdentityID : "{dddd428e-5ac8-4a81-9f78-276c734f75b8}",
	
	unicodeConverter : Components.classes["@mozilla.org/intl/scriptableunicodeconverter"]
		.createInstance(Components.interfaces.nsIScriptableUnicodeConverter),
	
	init: function() {
		if (vI_rdfDatasource.rdfDataSource) return;
		var file = Components.classes["@mozilla.org/file/directory_service;1"]
			.getService(Components.interfaces.nsIProperties)
			.get("ProfD", Components.interfaces.nsIFile);
		vI_notificationBar.dump("## vI_rdfDatasource read rdf from '" + file.path + "/" + vI_rdfDatasource.rdfFileName + "'\n");
		vI_rdfDatasource.rdfDataSource =
			vI_rdfDatasource.rdfService.GetDataSourceBlocking("file://" + file.path + "/" + vI_rdfDatasource.rdfFileName);
	},
	
	rdfUpgradeRequired: function() {
		oldRdfVersion = vI_rdfDatasource.getCurrentRDFFileVersion();
		var versionChecker = Components.classes["@mozilla.org/xpcom/version-comparator;1"]
			.getService(Components.interfaces.nsIVersionComparator);
		return (!oldRdfVersion || versionChecker.compare(oldRdfVersion, vI_rdfDatasource.rdfVersion) < 0)
	},
	
	extUpgrade: function() {
		oldExtVersion = vI_rdfDatasource.getCurrentExtFileVersion()
		var versionChecker = Components.classes["@mozilla.org/xpcom/version-comparator;1"]
			.getService(Components.interfaces.nsIVersionComparator);
		var extVersion = vI_rdfDatasource.extensionManager.getItemForID(vI_rdfDatasource.virtualIdentityID).version
		return (!oldExtVersion || versionChecker.compare(oldExtVersion, extVersion) < 0)	
	},
	
	getCurrentRDFFileVersion: function() {
		return vI_rdfDatasource.__getRDFValue(
			vI_rdfDatasource.rdfService.GetResource(vI_rdfDatasource.rdfNS + "virtualIdentity"), "rdfVersion");
	},
	
	getCurrentExtFileVersion: function() {
		return vI_rdfDatasource.__getRDFValue(
			vI_rdfDatasource.rdfService.GetResource(vI_rdfDatasource.rdfNS + "virtualIdentity"), "version");
	},
	
	initRDFDataSource: function() {
		vI_rdfDatasource.__setRDFValue(
			vI_rdfDatasource.rdfService.GetResource(vI_rdfDatasource.rdfNS + "virtualIdentity"), "rdfVersion",
			vI_rdfDatasource.rdfVersion);
		vI_rdfDatasource.flush();
	},
	
	storeExtVersion: function() {
		var value = vI_rdfDatasource.extensionManager.getItemForID(vI_rdfDatasource.virtualIdentityID).version
		vI_rdfDatasource.__setRDFValue(
			vI_rdfDatasource.rdfService.GetResource(vI_rdfDatasource.rdfNS + "virtualIdentity"), "version", value)
		vI_rdfDatasource.flush();
	},

	flush : function() {
		vI_rdfDatasource.rdfDataSource.QueryInterface(Components.interfaces.nsIRDFRemoteDataSource);
		vI_rdfDatasource.rdfDataSource.Flush();
	},
	
	__getRDFResourceForVIdentity : function (recDescription, recType) {
		if (!vI_rdfDatasource.rdfDataSource) return null;
		recDescription = recDescription.replace(/^\s+|\s+$/g,"")
		if (!recDescription) return null;
		var rdfNSRecType = null
		switch (recType) {
			case "email": rdfNSRecType = vI_rdfDatasource.rdfNSEmail; break;
			case "newsgroup" : rdfNSRecType = vI_rdfDatasource.rdfNSNewsgroup; break;
			case "maillist" : rdfNSRecType = vI_rdfDatasource.rdfNSMaillist; break;
		}
		return vI_rdfDatasource.rdfService.GetResource(vI_rdfDatasource.rdfNS + rdfNSRecType + recDescription);
	},

	readVIdentityFromRDF : function (recDescription, recType) {
		vI_notificationBar.dump("## vI_rdfDatasource: readVIdentityFromRDF.\n");
		var resource = vI_rdfDatasource.__getRDFResourceForVIdentity(recDescription, recType);
		if (!resource) return null;
		
		var email = vI_rdfDatasource.rdfService.GetResource(vI_rdfDatasource.rdfNS + "rdf#email");
		if (!vI_rdfDatasource.rdfDataSource.hasArcOut(resource, email)) return null;
		vI_notificationBar.dump("## vI_rdfDatasource: readVIdentityFromRDF found stored data.\n");
		
		var email = vI_rdfDatasource.__getRDFValue(resource, "email")
		var fullName = vI_rdfDatasource.__getRDFValue(resource, "fullName")
		var id = vI_rdfDatasource.__getRDFValue(resource, "id")
		var smtp = vI_rdfDatasource.__getRDFValue(resource, "smtp")
		
		return { email : email, fullName : fullName, id : id, smtp : (smtp="default"?"":smtp) };
	},
	
	__getRDFValue : function (resource, field) {
		var predicate = vI_rdfDatasource.rdfService.GetResource(vI_rdfDatasource.rdfNS + "rdf#" + field);
		var target = vI_rdfDatasource.rdfDataSource.GetTarget(resource, predicate, true);
		if (target instanceof Components.interfaces.nsIRDFLiteral) return target.Value
		else return null;
	},
	
	updateRDFFromVIdentity : function(recDescription, recType) {
		var address = vI.helper.getAddress();	
		var id_key = vI_msgIdentityClone.elements.Obj_MsgIdentity_clone.getAttribute("oldvalue");
		if (!id_key) id_key = vI_msgIdentityClone.elements.Obj_MsgIdentity_clone.getAttribute("value");
		var smtp_key = vI_smtpSelector.elements.Obj_SMTPServerList.selectedItem.getAttribute("key");
		
		vI_rdfDatasource.updateRDF(recDescription, recType, address.email, address.name, id_key, (smtp_key?smtp_key:"default"));
	},
	
	updateRDF : function (recDescription, recType, email, fullName, id, smtp) {
		if (!recDescription.replace(/^\s+|\s+$/g,"")) return;
		var resource = vI_rdfDatasource.__getRDFResourceForVIdentity(recDescription, recType);
		if (!resource) return null;

		vI_rdfDatasource.__setRDFValue(resource, "email", email)
		vI_rdfDatasource.__setRDFValue(resource, "fullName", fullName)
		vI_rdfDatasource.__setRDFValue(resource, "id", id)
		vI_rdfDatasource.__setRDFValue(resource, "smtp", smtp)
	},

	__setRDFValue : function (resource, field, value) {
		var predicate = vI_rdfDatasource.rdfService.GetResource(vI_rdfDatasource.rdfNS + "rdf#" + field);
		var name = vI_rdfDatasource.rdfService.GetLiteral(value);
		var target = vI_rdfDatasource.rdfDataSource.GetTarget(resource, predicate, true);
		
		if (target instanceof Components.interfaces.nsIRDFLiteral)
			vI_rdfDatasource.rdfDataSource.Change(resource, predicate, target, name);
		else	vI_rdfDatasource.rdfDataSource.Assert(resource, predicate, name, true);
	},
}
window.addEventListener("load", vI_rdfDatasource.init, false);
window.addEventListener("unload", vI_rdfDatasource.flush, false);