import { Component, OnInit } from '@angular/core';
import {AppConfig} from "../../../environments/environment";

export interface IHash {
  [details: string] : string;
}


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

export class HomeComponent implements OnInit {

  constructor() {

    var chokidar = require('chokidar');

    let fileHssh: IHash = {};

    var watcher = chokidar.watch(AppConfig.PSDirectory, {
      ignored: /[\/\\]\./,
      persistent: true
    });

    // Declare the listeners of the watcher
    watcher
      .on('add', function(path) {
        console.log('File', path, 'has been added');
         fs.watchFile(path, {persistent:true, interval:500}, (curr, prev)=>{
           console.log(`path is : ${path}`);
           //console.log(`path is: ${curr.)}`);
           //console.log(`the current mtime is: ${curr.mtime}`);
           //console.log(`the previous mtime was: ${prev.mtime}`);

           if(path.endsWith(".txt")){

             console.log('path ended with .txt - opening file')
             let a = require('growing-file');

             var b = a.open(path, {
               timeout: false,
               interval: 500,
               startFromEnd: false});

             fileHssh[path] = b //set

             //let value = fileHssh["somestring"]; //get
           }
         })
      })
      .on('addDir', function(path) {
        console.log('Directory', path, 'has been added');
      })
      .on('change', function(path) {
        //console.log('File', path, 'has been changed');
      })
      .on('unlink', function(path) {
        //console.log('File', path, 'has been removed');
      })
      .on('unlinkDir', function(path) {
        //console.log('Directory', path, 'has been removed');
      })
      .on('error', function(error) {
        //console.log('Error happened', error);
      })
      .on('ready', this.onWatcherReady)
      .on('raw', function(event, path, details) {
        // This event should be triggered everytime something happens.
        console.log('Raw event info:', event, path, details);
        console.log(details.watchedPath);

        if(event=='change'
        && details.watchedPath.endsWith(".txt")
        ){
          console.log(fileHssh[details.watchedPath])
        }
    });

    var fs = require('fs');
    fs.watch( AppConfig.PSDirectory, {encoding: 'buffer'}, (eventTYpe, filename)=>{
      if(eventTYpe == 'change')
        console.log('changed')
      else
        console.log(eventTYpe)
    });
  }

  ngOnInit() {
  }

  onWatcherReady(){
    console.info('From here can you check for real changes, the initial scan has been completed.');
  }

}
