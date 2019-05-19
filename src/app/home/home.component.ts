import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { AppserviceService } from './../appservice.service';
import { SocketService } from './../socket.service';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { ToastrManager } from 'ng6-toastr-notifications';



@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [SocketService]
})
export class HomeComponent implements OnInit {
  @ViewChild('textmessage') textmessage: any;
  @ViewChild('scrollMe', { read: ElementRef })

  public scrollToChatTop = false;

  public authToken: any;
  public userInfo: any;
  public userList: any = [];
  public receiverId: any;
  public receiverName: any;
  public disconnectedSocket: boolean;

  public previousChatList: any[];
  public messageText: any ='';
  public messageList: any = [];
  public pageValue = 0;
  public loadingPreviousChat = false;
  public emoji;
  public showEmoji: boolean = false;

  constructor( public appService: AppserviceService, public socketService: SocketService, public router: Router, private toastr: ToastrManager, private Cookie: CookieService
    ){ }

  ngOnInit() {

    this.authToken = this.Cookie.get('authToken');
    this.userInfo = this.appService.getUserInfoFromLocalStorage();
    

    this.verifyUserConfirmation() ;
    this.getOnlineUserList(); 
    this.getMessageFromAUser();


}

public verifyUserConfirmation: any = () => {

  this.socketService.verifyUser().subscribe((data) => {

    this.disconnectedSocket = false;

    this.socketService.setUser(this.authToken);

  });
}
public getOnlineUserList: any = () => {

  this.socketService.onlineUserList().subscribe((userList) => {
   
    this.userList = [];

    for (const x in userList) {

      const temp = { 'userId': x, 'name': userList[x] };

      this.userList.push(temp);

    }  // console.log(this.userList);
    //console.log('userlist')
   // console.log(this.userList);
  }); // end online-user-list
}

public userSelectedToChat: any = (id, name) => {

 // console.log('setting user as active');
 // console.log(id, name)

  // setting that user to chatting true
  this.userList.map((user) => {
    if (user.userId === id) {
      user.chatting = true;
    } else {
      user.chatting = false;
    }
  });

  this.Cookie.set('receiverId', id);

  this.Cookie.set('receiverName', name);


  this.receiverName = name;

  this.receiverId = id;

  this.messageList = [];

  const chatDetails = {
    userId: this.userInfo.userId,
    senderId: id
  };

  this.getPreviousChatWithAUser();




} // end userBtnClick function

public toggleEmoji = () => {
  this.showEmoji = !this.showEmoji;
} 
public selected = ($event: any) => {
 
 this.messageText = this.messageText + $event.emoji.native
  
} 

public sendMessageUsingKeypress = (message) => {
  this.sendMessage();
  this.showEmoji =false;
}

public sendMessage: any = () => {

  if (this.messageText) {

    const chatMsgObject = {
      senderName: this.userInfo.userName,
      senderId: this.userInfo.userId,
      receiverName: this.Cookie.get('receiverName'),
      receiverId: this.Cookie.get('receiverId'),
     // message: this.messageText,
      message: this.textmessage.nativeElement.value,
      createdOn: new Date()
    };  // end chatMsgObject
   // console.log(chatMsgObject);
    this.socketService.SendChatMessage(chatMsgObject);
    this.pushToChatWindow(chatMsgObject);
    

  } else {
    this.toastr.warningToastr('text message can not be empty');

  }

} // end sendMessage

public pushToChatWindow: any = (data) => {
  //this.messageText = '';
  
  //console.log(this.textmessage);
  
  this.messageText = "";  
  this.messageList.push(data);
  this.textmessage.nativeElement.value = '';
  this.scrollToChatTop = false;
 
 
}// end push to chat window


public getMessageFromAUser: any = () => {
  //console.log(this.userInfo.userId)

  this.socketService.chatByUserId(this.userInfo.userId).subscribe((data) => {
   console.log(data);
    // tslint:disable-next-line:no-unused-expression
    (this.receiverId === data.senderId) ? this.messageList.push(data) : '';

    this.toastr.successToastr(`${data.senderName} says : ${data.message}`);

    this.scrollToChatTop = false;

  }); // end subscribe

}// end get message from a user

public getPreviousChatWithAUser: any = () => {
  const previousData = (this.messageList.length > 0 ? this.messageList.slice() : []);

  this.appService.getChat(this.userInfo.userId, this.receiverId, this.pageValue * 10).subscribe((apiResponse) => {

    console.log(apiResponse);

    if (apiResponse.status === 200) {

      this.messageList = apiResponse.data.concat(previousData);
      console.log(this.messageList);

    } else {

      this.messageList = previousData;
      this.toastr.warningToastr(apiResponse.message);
    }

    this.loadingPreviousChat = false;

  }, (err) => {

    this.toastr.errorToastr('some error occured');


  });

}// end get previous chat with any user


public logout: any = () => {

  let data = {
    userId: this.userInfo.userId,
    authToken: this.authToken
  }
  
  this.appService.logout(data).subscribe((apiResponse: any) => {

    if (apiResponse.status === 200) {
      
      this.Cookie.delete('authToken');

      this.Cookie.delete('receiverId');

      this.Cookie.delete('receiverName');

      this.socketService.exitSocket();

      this.toastr.successToastr(apiResponse.message);

      this.router.navigate(['/']);

    } else {
      this.toastr.errorToastr(apiResponse.message);

    } // end condition

  }, (err) => {
    this.toastr.errorToastr('some error occured');


  });

} // end logout

}
