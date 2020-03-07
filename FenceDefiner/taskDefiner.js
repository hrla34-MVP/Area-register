import * as TaskManager from 'expo-task-manager';
import {Notifications} from 'expo';
import * as Location from 'expo-location';
/*
  Pass in the name you want to give to the task, defaults to 'notification' if nothing is passed
  This name just be the exact same name as the property sent to fence definer
  
  We expect that the 'identifier' to be loaded with a bunch of data
  Specifically:
    name: name of the area
    title: title to give the notification
    body: body of the notification
*/


export default defineTask = (taskName = 'notification') => {

  TaskManager.defineTask(taskName, (val) => {
    let data = val.data;
    let error = val.error;

    let eventType = data.eventType;
    let region = data.region;

    // let parsedFromIdentifier = JSON.parse(region.identifier);

   

    if (error) {
      console.error(error.message);
    }

    // We are opting to just use default messages
    if (eventType === Location.GeofencingEventType.Enter) {
      scheduleNotification(region, `You have entered ${region}`);
    } else if (eventType === Location.GeofencingEventType.Exit) {
      scheduleNotification(region, `You have left ${region}`);
    }

    // This would have let us do custom messages
    // scheduleNotification(parsedFromIdentifier.title, parsedFromIdentifier.body);

  })

}

/*
  schedules the notification to basically occur instantly
  Will use the parsed data from defineTask
*/

let scheduleNotification = (title, body)=> {
  const localNotification = {
    title: title,
    body: body,
    android: {
      sound: true
    },
    ios: {
      sound: true
    }
  };

  let notificationTime = Date.now() + 500;

  const schedulingOptions = {time: notificationTime};

  let id = Notifications.scheduleLocalNotificationAsync(
    localNotification,
    schedulingOptions
  );
}