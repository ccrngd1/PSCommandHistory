import { Component, OnInit } from '@angular/core';
import {AppConfig} from '../../../environments/environment';
import GrowFile from 'growing-file';
import {MatButtonModule, MatCheckboxModule} from '@angular/material';
import {forEach} from '@angular/router/src/utils/collection';

export interface IHash {
  [details: string]: GrowFile;
}

class PSCommand {
  location: string;
  command: string;

  constructor(l: string, c: string) {
    this.location = l;
    this.command = c;
  }
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {

  PSCommands: string [] = [];
  PSCommandExt: PSCommand [] = [];

  public parsePSLine(PSCommandLine: string): void {
    const cmdChunk = PSCommandLine.toString().split('\r\n');

    console.log('starting parsePSLine');

    let psTranscriptionHeader = false;
    let cmdDetected = false;
    let partialCommand = '';

    const self = this;

    cmdChunk.forEach(function (value) {
      if (value !== undefined || value !== '') {
        // console.log(`parsePSLine - value detected - ${value}`);
        if (value === '"**********************') { psTranscriptionHeader = !psTranscriptionHeader; }

        if (value[0] === '*') { return ; }

        if (psTranscriptionHeader === true ) { return; }

        if (value.startsWith('PS ')) {
          // console.log(`parsePSLine - PS detected - ${value}`);
          if ( cmdDetected === true ) {
            // console.log(`pushing ${partialCommand}`);

            self.PSCommands.push(partialCommand);
            self.PSCommandExt.push(new PSCommand(partialCommand.split('>')[0].split('PS ')[1], partialCommand.split('>')[1]));

            partialCommand = '';
          }
          cmdDetected = true;
          partialCommand += value;
          return;
        } else {
          if ( value === undefined || value === '') {
            if (cmdDetected === true) {
              cmdDetected = false;

              self.PSCommands.push(partialCommand);
              self.PSCommandExt.push(new PSCommand(partialCommand.split('>')[0].split('PS ')[1], partialCommand.split('>')[1]));

              partialCommand = '';
            }
          }
        }

      }
    });

    return;
  }

  constructor() {

    const chokidar = require('chokidar');

    const fileHash: IHash = {};

    const watcher = chokidar.watch(AppConfig.PSDirectory, {
      ignored: /[\/\\]\./,
      persistent: true
    });

    const self = this;

    // Declare the listeners of the watcher
    watcher
      .on('add', function(path) {
        console.log('File', path, 'has been added');
          fs.watchFile(path, {persistent: true, interval: 500}, (curr, prev) => {
           console.log(`path is : ${path}`);
           // console.log(`path is: ${curr.)}`);
           // console.log(`the current mtime is: ${curr.mtime}`);
           // console.log(`the previous mtime was: ${prev.mtime}`);

           if (path.endsWith('.txt')) {
             console.log('path ended with .txt - opening file');

             if ( fileHash[path] !== undefined ) { return; }

             let a = require('growing-file');
             fileHash[path] = a.open(path, {
               timeout: Infinity,
               interval: 500,
               startFromEnd: true});

             console.log(fileHash[path]);

             // fileHash[path]t.resume();

             fileHash[path].on('data', (chunk) => {
                console.log(`Received ${chunk.length} bytes of data on open.`);
                console.log('b.On firing');
               // has to be 'self' that is assigned out, because 'this' points to
               // GrowingFile because we are inside this anonymous function (???)
               self.parsePSLine(chunk.toString());
             });

             fileHash[path].on('error', (info) => {
               console.log(`error on open - ${info}`);
             });
             fileHash[path].on('end', () => {
              console.log('end event on open');
             });

           }
          });
      })
      .on('addDir', function(path) {
        console.log('Directory', path, 'has been added');
      })
      .on('change', function(path) {
        // console.log('File', path, 'has been changed');
      })
      .on('unlink', function(path) {
        // console.log('File', path, 'has been removed');
      })
      .on('unlinkDir', function(path) {
        // console.log('Directory', path, 'has been removed');
      })
      .on('error', function(error) {
        // console.log('Error happened', error);
      })
      .on('ready', this.onWatcherReady)
      .on('raw', function(event, path, details) {
        // This event should be triggered every time something happens.
        console.log('Raw event info:', event, path, details);
        console.log(details.watchedPath);

        if (event === 'change'
        && details.watchedPath.endsWith('.txt')
        ) {
          console.log('looking up fileHash[watchedPath]');
          console.log(`looking up ${fileHash[details.watchedPath]}`);

          if (fileHash[details.watchedPath] === undefined) {
            const a = require('growing-file');

            const b = a.open(details.watchedPath, {
              timeout: Infinity,
              interval: 500 });

            fileHash[details.watchedPath] = b;

            b.on('data', (chunk) => {
              console.log(`Received ${chunk.length} bytes of data during change.`);
              console.log('b.On firing');
              // has to be 'self' that is assigned out, because 'this' points to
              // GrowingFile because we are inside this anonymous function (???)
              self.parsePSLine(chunk.toString());

            });
          } else {
            console.log('existing fileHash found - should read offset data');

            let c: GrowFile = fileHash[details.watchedPath];
            console.log(c);
            c
            c.resume();
          }
        }
    });

     const fs = require('fs');
     fs.watch( AppConfig.PSDirectory, {encoding: 'buffer'}, (eventTYpe, filename) => {
       if (eventTYpe === 'change') {
         console.log('changed');
       } else {
         console.log(eventTYpe);
       }
     });
  }

  btnCmdCopy(event: Event) {
    // console.log('Called!!!', event);
    // console.log(event.srcElement.textContent);

    const {clipboard} = require('electron');
    clipboard.writeText(event.srcElement.textContent);
  }

  btnPathCopy(event: Event) {
    // console.log('Called!!!', event);
    // console.log(event.srcElement.textContent);

    const {clipboard} = require('electron');
    clipboard.writeText(`cd "${event.srcElement.textContent}"`);
  }

  ngOnInit() {
  }

  onWatcherReady() {
    console.log('From here can you check for real changes, the initial scan has been completed.');
  }

}
