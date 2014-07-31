
/**
* some code copied and adapted from Thunderbird Sources
* thanks to all Thunderbird Developers
*/

/* -*- Mode: Java; tab-width: 4; indent-tabs-mode: nil; c-basic-offset: 4 -*-
 * ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Mozilla Communicator client code, released
 * March 31, 1998.
 *
 * The Initial Developer of the Original Code is
 * Netscape Communications Corporation.
 * Portions created by the Initial Developer are Copyright (C) 1998-1999
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either of the GNU General Public License Version 2 or later (the "GPL"),
 * or the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK ***** */

Components.utils.import("resource://v_identity/vI_nameSpaceWrapper.js");
virtualIdentityExtension.ns(function() { with (virtualIdentityExtension.LIB) {

function InitFolderDisplays(msgFolder, accountPickerId, folderPickerId) {
    var accountPicker = document.getElementById(accountPickerId);
    var folderPicker = document.getElementById(folderPickerId);
    InitFolderDisplay(msgFolder.server.rootFolder, accountPicker);
    InitFolderDisplay(msgFolder, folderPicker);
}

// Initialize the folder display based on prefs values
function InitFolderDisplay(folder, folderPicker) {
    try {
      folderPicker.firstChild.selectFolder(folder);
    } catch(ex) {
      folderPicker.setAttribute("label", folder.prettyName);
    }
    folderPicker.folder = folder;
}

// Capture any menulist changes
function noteSelectionChange(radioItemId, aEvent)
{
    var checkedElem = document.getElementById(radioItemId);
    var folder = aEvent.target._folder;
    var modeValue  = checkedElem.value;
    var radioGroup = checkedElem.radioGroup.getAttribute("id");
    var picker;
    switch (radioGroup)
    {
        case "VIdent_doFcc" :
            vI.gFccRadioElemChoice = modeValue;
            picker = document.getElementById("msgFccFolderPicker");
            break;
    
        case "VIdent_messageDrafts" :
            vI.gDraftsRadioElemChoice = modeValue;
            picker = document.getElementById("msgDraftsFolderPicker");
            break;

        case "VIdent_messageTemplates" :
            vI.gTmplRadioElemChoice = modeValue;
            picker = document.getElementById("msgStationeryFolderPicker");
            break;
    }
    picker.folder = folder;
    picker.setAttribute("label", folder.prettyName);
}

// Save folder settings and radio element choices
function SaveFolderSettings(radioElemChoice, 
                            radioGroupId,
                            folderSuffix,
                            accountPickerId,
                            folderPickerId,
                            folderElementId,
                            folderPickerModeId)
{
    var formElement = document.getElementById(folderElementId);
    var uri = "";

    switch (radioElemChoice) 
    {
        case "0" :
            uri = document.getElementById(accountPickerId).selectedItem._folder.URI;
            if (uri) {
                // Create  Folder URI
                uri = uri + folderSuffix;
            }
            break;

        case "1" : 
            uri = document.getElementById(folderPickerId).folder.URI;
            break;

        default :
            break;
    }
    formElement.setAttribute("value", uri);

    formElement = document.getElementById(folderPickerModeId);
    formElement.setAttribute("value", radioElemChoice);
}
vI.InitFolderDisplays = InitFolderDisplays;
vI.SaveFolderSettings = SaveFolderSettings;
vI.noteSelectionChange = noteSelectionChange;
}});