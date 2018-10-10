/*
 * Copyright 2007-2017 Charles du Jeu - Abstrium SAS <team (at) pyd.io>
 * This file is part of Pydio.
 *
 * Pydio is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Pydio is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with Pydio.  If not, see <http://www.gnu.org/licenses/>.
 *
 * The latest code can be found at <https://pydio.com>.
 */



import React, {Component} from 'react'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { Table, TableBody, TableRow, TableRowColumn } from 'material-ui'
import Player from './Player';

class Editor extends Component {

    static get styles() {
        return {
            container: {
                margin: "auto",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                flex: 1
            },
            player: {
                margin: "auto"
            },
            table: {
                width: "100%"
            }
        }
    }

    componentWillReceiveProps(nextProps) {
        const sound = soundManager.getSoundById(nextProps.node.getPath())

        if (sound && this.props.node.getPath() !== nextProps.node.getPath()) {
            soundManager.soundIDs.map((soundID) => soundManager.sounds[soundID].stop())
        }

        if (sound)  {
            if (nextProps.selectionPlaying) {
                sound.play()
            } else {
                sound.pause()
            }
        }
    }

    render() {


        return (
            <div style={Editor.styles.container}>
                <Table
                    style={Editor.styles.table}
                    selectable={true}
                    multiSelectable={true}
                >
                    <TableBody
                        displayRowCheckbox={false}
                        stripedRows={false}
                    >
                    {this.props.selection && this.props.selection.selection.map( (node, index) => {

                            return (
                                <TableRow key={index}>
                                    <TableRowColumn>{index + 1}</TableRowColumn>
                                    <TableRowColumn>{node.getLabel()}</TableRowColumn>
                                </TableRow>
                            )
                    })}
                    </TableBody>
                </Table>
            </div>
        );
    }
}

function guid() {
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

function s4() {
    return Math.floor((1 + Math.random()) * 0x10000)
        .toString(16)
        .substring(1);
}

const {withSelection, withMenu, withLoader, withErrors, withControls} = PydioHOCs;

const editors = pydio.Registry.getActiveExtensionByType("editor")
const conf = editors.filter(({id}) => id === 'editor.soundmanager')[0]

const getSelectionFilter = (node) => conf.mimes.indexOf(node.getAjxpMime()) > -1

const getSelection = (node) => new Promise((resolve, reject) => {
    let selection = [];

    node.getParent().getChildren().forEach((child) => selection.push(child));
    selection = selection.filter(getSelectionFilter)

    resolve({
        selection,
        currentIndex: selection.reduce((currentIndex, current, index) => current === node && index || currentIndex, 0)
    })
})

const getTime = function(nMSec,bAsString) {

  // convert milliseconds to mm:ss, return as object literal or string
  var nSec = Math.floor(nMSec/1000),
      min = Math.floor(nSec/60),
      sec = nSec-(min*60);
  // if (min === 0 && sec === 0) return null; // return 0:00 as null
  return (bAsString?(min+':'+(sec<10?'0'+sec:sec)):{'min':min,'sec':sec});

};

export default compose(
    withSelection(getSelection),
    connect()
)(Editor)
