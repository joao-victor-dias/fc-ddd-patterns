import Address from "../value-object/address";
import Customer from "../entity/customer";
import EventDispatcher from "../../@shared/event/event-dispatcher";
import CustomerCreatedEvent from "./customer-created.event";
import CustomerAddressChangedEvent from "./customer-address-changed.event";
import SendConsoleLog1WhenCustomerIsCreatedHandler from "./handler/send-console-log-1-when-customer-is-created.handler";
import SendConsoleLog2WhenCustomerIsCreatedHandler from "./handler/send-console-log-2-when-customer-is-created.handler";
import SendConsoleLogWhenCustomerAddressIsChangedHandler from "./handler/send-console-log-when-customer-address-is-changed.handler";

describe("Customer events tests", () => {
  it("should log when CustomerCreated event is dispatched", () => {
    const eventDispatcher = new EventDispatcher();

    const handler1 =
      new SendConsoleLog1WhenCustomerIsCreatedHandler();
    const handler2 =
      new SendConsoleLog2WhenCustomerIsCreatedHandler();

    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    eventDispatcher.register("CustomerCreatedEvent", handler1);
    eventDispatcher.register("CustomerCreatedEvent", handler2);

    const customer = new Customer("1", "João");

    const event = new CustomerCreatedEvent({
      id: customer.id,
      name: customer.name,
    });

    eventDispatcher.notify(event);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Esse é o primeiro console.log do evento: CustomerCreated"
    );
    expect(consoleSpy).toHaveBeenCalledWith(
      "Esse é o segundo console.log do evento: CustomerCreated"
    );

    consoleSpy.mockRestore();
  });

  it("should log when CustomerAddressChanged event is dispatched", () => {
    const eventDispatcher = new EventDispatcher();

    const handler =
      new SendConsoleLogWhenCustomerAddressIsChangedHandler();

    const consoleSpy = jest.spyOn(console, "log").mockImplementation();

    eventDispatcher.register("CustomerAddressChangedEvent", handler);

    const customer = new Customer("1", "João");
    const address = new Address("Rua A", 10, "12345-000", "Belo Horizonte");

    customer.changeAddress(address);

    const event = new CustomerAddressChangedEvent({
      id: customer.id,
      name: customer.name,
      address: `${address.street}, ${address.number}, ${address.zip}, ${address.city}`,
    });

    eventDispatcher.notify(event);

    expect(consoleSpy).toHaveBeenCalledWith(
      "Endereço do cliente: 1, João alterado para: Rua A, 10, 12345-000, Belo Horizonte"
    );

    consoleSpy.mockRestore();
  });
});