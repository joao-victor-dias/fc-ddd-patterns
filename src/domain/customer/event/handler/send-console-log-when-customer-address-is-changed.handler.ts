import EventHandlerInterface from "../../../@shared/event/event-handler.interface";
import EventInterface from "../../../@shared/event/event.interface";

export default class SendConsoleLogWhenCustomerAddressIsChangedHandler
  implements EventHandlerInterface<EventInterface>
{
  handle(event: EventInterface): void {
    const { id, name, address } = event.eventData;

    console.log(
      `Endereço do cliente: ${id}, ${name} alterado para: ${address}`
    );
  }
}