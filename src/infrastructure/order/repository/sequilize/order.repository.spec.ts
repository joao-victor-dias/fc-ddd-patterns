import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderModel from "./order.model";
import OrderItemModel from "./order-item.model";
import OrderRepository from "./order.repository";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import ProductModel from "../../../product/repository/sequelize/product.model";

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
    });

    sequelize.addModels([
      CustomerModel,
      ProductModel,
      OrderModel,
      OrderItemModel,
    ]);

    await sequelize.sync();

    await CustomerModel.create({
      id: "c1",
      name: "Customer 1",
      street: "Street 1",
      number: 1,
      zipcode: "12345",
      city: "City 1",
      active: true,
      rewardPoints: 0,
    });

    await CustomerModel.create({
      id: "c2",
      name: "Customer 2",
      street: "Street 2",
      number: 2,
      zipcode: "54321",
      city: "City 2",
      active: true,
      rewardPoints: 0,
    });

    await ProductModel.create({
      id: "p1",
      name: "Product 1",
      price: 10,
    });

    await ProductModel.create({
      id: "p2",
      name: "Product 2",
      price: 20,
    });
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create an order", async () => {
    const orderRepository = new OrderRepository();

    const item1 = new OrderItem("1", "Item 1", 10, "p1", 2);
    const item2 = new OrderItem("2", "Item 2", 20, "p2", 1);
    const order = new Order("123", "c1", [item1, item2]);

    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: "123" },
      include: [OrderItemModel],
    });

    expect(orderModel!.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "c1",
      total: 40,
      items: [
        {
          id: "1",
          name: "Item 1",
          product_id: "p1",
          price: 10,
          quantity: 2,
          order_id: "123",
        },
        {
          id: "2",
          name: "Item 2",
          product_id: "p2",
          price: 20,
          quantity: 1,
          order_id: "123",
        },
      ],
    });
  });

  it("should update an order", async () => {
    const orderRepository = new OrderRepository();

    const item1 = new OrderItem("1", "Item 1", 10, "p1", 2);
    const order = new Order("123", "c1", [item1]);

    await orderRepository.create(order);

    const item2 = new OrderItem("2", "Item 2", 20, "p2", 3);
    const updatedOrder = new Order("123", "c1", [item2]);

    await orderRepository.update(updatedOrder);

    const orderModel = await OrderModel.findOne({
      where: { id: "123" },
      include: [OrderItemModel],
    });

    expect(orderModel!.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "c1",
      total: 60,
      items: [
        {
          id: "2",
          name: "Item 2",
          product_id: "p2",
          price: 20,
          quantity: 3,
          order_id: "123",
        },
      ],
    });
  });

  it("should find an order", async () => {
    const orderRepository = new OrderRepository();

    const item1 = new OrderItem("1", "Item 1", 10, "p1", 2);
    const item2 = new OrderItem("2", "Item 2", 20, "p2", 1);
    const order = new Order("123", "c1", [item1, item2]);

    await orderRepository.create(order);

    const foundOrder = await orderRepository.find("123");

    expect(foundOrder).toStrictEqual(order);
  });

  it("should throw an error when order is not found", async () => {
    const orderRepository = new OrderRepository();

    await expect(orderRepository.find("not-found")).rejects.toThrow(
      "Order not found"
    );
  });

  it("should find all orders", async () => {
    const orderRepository = new OrderRepository();

    const order1 = new Order("123", "c1", [
      new OrderItem("1", "Item 1", 10, "p1", 2),
    ]);

    const order2 = new Order("456", "c2", [
      new OrderItem("2", "Item 2", 20, "p2", 1),
    ]);

    await orderRepository.create(order1);
    await orderRepository.create(order2);

    const orders = await orderRepository.findAll();

    expect(orders).toHaveLength(2);
    expect(orders).toContainEqual(order1);
    expect(orders).toContainEqual(order2);
  });
});