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

var EXPORTED_SYMBOLS = [];

const Ci = Components.interfaces;
const Cc = Components.classes;
const Cu = Components.utils;


Cu.import("resource://v_identity/vI_identityDataExtras.js");
Cu.import("resource://v_identity/vI_log.js");
let Log = setupLogging("virtualIdentity.identityDataExtras.sMimeSignature");

function identityDataExtrasObject_sMimeSignature(currentWindow) {
  this._currentWindow = currentWindow;
  this.field = "sMimeSig"; // description of the option
  this.option = "storageExtras_sMime_messageSignature"; // option string to get preference settings
  this.elementID_msgCompose = "menu_securitySign1";
  this.updateFunction_msgCompose = function () {
    (typeof (this._currentWindow.setSecuritySettings) == 'function') ? this._currentWindow.setSecuritySettings(1): null
  };
}
identityDataExtrasObject_sMimeSignature.prototype = {
  __proto__: identityDataExtrasCheckboxObject.prototype,

  readIdentityValue: function (identity) {
    if (this.active) this.value = (identity.getBoolAttribute('sign_mail')) ? "true" : "false";
  }
}
registerIdExtrasObject(identityDataExtrasObject_sMimeSignature);