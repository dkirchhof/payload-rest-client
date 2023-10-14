import { createClient } from ".";

// generated from payload

interface Config {
    collections: {
        users: User;
    };
    globals: {
        settings: Settings;
    };
}

export interface User {
    id: string;
    email: string;
    name: string;
    password: string;
}

export interface Settings {
    id: string;
    test: string;
}

// end of generated types

type Locales = "de" | "en";

const client = createClient<Config, Locales>({
    apiUrl: "http://localhost:4000/api",
    cache: "no-store",
});

const test = async () => {
    // collections

    const users1 = await client.collections.users.find({
        sort: "-email",
        locale: "de",
    });

    console.log("##### all users #####")
    console.log(users1);

    const newUser = await client.collections.users.create({
        doc: { id: "", name: "hans", email: "test@test.de", password: "password" },
    });

    console.log("##### new user #####")
    console.log(newUser);

    const updatedUsers = await client.collections.users.update({
        patch: { name: "new name" },
        where: { email: { equals: "test@test.de" } },
    });

    console.log("##### updated users #####")
    console.log(updatedUsers);

    const updatedUser = await client.collections.users.updateById({
        id: newUser.doc.id,
        patch: { name: "next new name" },
    });

    console.log("##### updated user #####")
    console.log(updatedUser);

    const deletedUsers = await client.collections.users.delete({
        where: {
            or: [
                { id: { equals: "foobar" } },
                { email: { equals: "foobar" } },
            ],
        },
    });

    console.log("##### deleted users #####")
    console.log(deletedUsers);

    const deletedUser = await client.collections.users.deleteById({
        id: newUser.doc.id,
    });

    console.log("##### deleted user #####")
    console.log(deletedUser);

    const users2 = await client.collections.users.find();

    console.log("##### all users #####")
    console.log(users2);

    // globals

    const settings = await client.globals.settings.get()

    console.log("##### settings #####")
    console.log(settings);

    const updatedSettings = await client.globals.settings.update({ patch: { test: "hello" } })

    console.log("##### updated settings #####")
    console.log(updatedSettings);
};

test();
