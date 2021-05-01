import { SubscriptionEvent } from "../requests/SubscriptionEvent";

interface Data<T> {
  [key: string]: T;
}

function received<T>(data: T) {
  return data;
}

const defaultGetId = <T extends any>(x: T): string | number =>
  "id" in (x as any) ? (x as any).id : x;

function changed<T>(
  prevData: Data<T> | null,
  newData: T[],
  getId = defaultGetId
) {
  const copy = prevData ? { ...prevData } : {};
  newData.forEach(item => {
    const id = getId(item);
    copy[id] = item;
  });
  console.log("handling changed", prevData, copy);
  return copy;
}

interface ReceivedEvent<T> {
  event: SubscriptionEvent & "received";
  prevData: Data<T> | null;
  newData: Data<T>;
  getId?: typeof defaultGetId;
}

type Event<T> =
  | ReceivedEvent<T>
  | {
      event: SubscriptionEvent & ("changed" | "appended" | "removed");
      prevData: Data<T> | null;
      newData: T[];
      getId?: typeof defaultGetId;
    };

function isReceived<T>(x: Event<T>): x is ReceivedEvent<T> {
  return x.event === "received";
}

export function mergeDict<T>(eventData: Event<T>): Data<T> {
  // const { event, prevData, newData } = eventData;
  if (isReceived(eventData)) {
    return received(eventData.newData);
  } else {
    const { event } = eventData;
    if (event === "changed") {
      return changed(eventData.prevData, eventData.newData, eventData.getId);
    }
  }
  throw new Error(`Unexpected event: ${event}`);
}

interface ListEvent<T> {
  event: SubscriptionEvent;
  prevData: T[] | null;
  newData: T[];
  getId?: typeof defaultGetId;
}

function listReceived<T>(data: T[]) {
  return data;
}

function toCollection<T>(list: T[], getId: typeof defaultGetId) {
  const collection: { [key: string]: T } = {};
  list.forEach(item => {
    collection[getId(item)] = item;
  });
  return collection;
}

function listChanged<T>(
  prevData: T[] | null,
  newData: T[],
  getId = defaultGetId
) {
  let didUpdateSomething = false;
  if (prevData === null) {
    throw new Error('Cannot handle "change" event before "received"');
  }
  const collection = toCollection(newData, getId);
  const newState = prevData.map(oldEntity => {
    const id = getId(oldEntity);
    if (id in collection) {
      didUpdateSomething = true;
      return collection[id];
    }
    return oldEntity;
  });
  if (!didUpdateSomething) {
    return prevData;
  }
  return newState;
}

function listRemoved<T>(
  prevData: T[] | null,
  newData: T[],
  getId = defaultGetId
) {
  if (prevData === null) {
    throw new Error('Cannot handle "removed" event before "received"');
  }
  const collection = toCollection(newData, getId);
  const without = prevData.filter(oldModel => !(getId(oldModel) in collection));
  if (without.length === prevData.length) {
    // did not remove anything
    return prevData;
  }
  return without;
}

function listAppended<T>(prevData: T[] | null, newData: T[]) {
  if (prevData === null) {
    throw new Error('Cannot handle "appended" event before "received"');
  }
  return [...prevData, ...newData];
}

export function mergeList<T>(eventData: ListEvent<T>): T[] {
  if (eventData.event === "received") {
    return listReceived(eventData.newData);
  } else if (eventData.event === "changed") {
    return listChanged(eventData.prevData, eventData.newData, eventData.getId);
  } else if (eventData.event === "removed") {
    return listRemoved(eventData.prevData, eventData.newData, eventData.getId);
  } else if (eventData.event === "appended") {
    return listAppended(eventData.prevData, eventData.newData);
  }
  throw new Error(`Unexpected event: ${eventData.event}`);
}

function listPrepended<T>(prevData: T[] | null, newData: T[]) {
  if (prevData === null) {
    throw new Error('Cannot handle "appended" event before "received"');
  }
  return [...newData, ...prevData];
}

export function mergeListReverseChronological<T>(eventData: ListEvent<T>): T[] {
  if (eventData.event === "received") {
    return listReceived(eventData.newData);
  } else if (eventData.event === "changed") {
    return listChanged(eventData.prevData, eventData.newData, eventData.getId);
  } else if (eventData.event === "removed") {
    return listRemoved(eventData.prevData, eventData.newData, eventData.getId);
  } else if (eventData.event === "appended") {
    return listPrepended(eventData.prevData, eventData.newData);
  }
  throw new Error(`Unexpected event: ${eventData.event}`);
}

export type MergeStrategy = typeof mergeDict | typeof mergeList;
