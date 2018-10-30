import { Component, OnInit } from '@angular/core';
import {AppConfig} from '../../../environments/environment';
import GrowFile from 'growing-file';
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
        console.log(`parsePSLine - value detected - ${value}`);
        if (value === '"**********************') { psTranscriptionHeader = !psTranscriptionHeader; }

        if (value[0] === '*') { return ; }

        if (psTranscriptionHeader === true ) { return; }

        if (value.startsWith('PS ')) {
          console.log(`parsePSLine - PS detected - ${value}`);
          if ( cmdDetected === true ) {
            console.log(`pushing ${partialCommand}`);

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
    })

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
             const a = require('growing-file');

             const b = a.open(path, {
               timeout: false,
               interval: 500,
               startFromEnd: false});

             console.log(b);

             fileHash[path] = b; // set

             // foundFile.resume();

             b.on('data', (chunk) => {
               // console.log(`Received ${chunk.length} bytes of data. ${chunk}`);

               // has to be 'self' that is assigned out, because 'this' points to
               // GrowingFile because we are inside this anonymous function (???)
               self.parsePSLine(chunk.toString());

             });

             // let value = fileHssh["somestring"]; //get
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
          let foundFile = fileHash[details.watchedPath];
          if (foundFile === undefined) {
            const a = require('growing-file');

            const b = a.open(details.watchedPath, {
              timeout: false,
              interval: 500,
              startFromEnd: false});
            fileHash[details.watchedPath] = b;
            foundFile = b;
          }

          console.log(foundFile);

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

  ngOnInit() {
  }

  onWatcherReady() {
    console.log('From here can you check for real changes, the initial scan has been completed.');
  }

}
