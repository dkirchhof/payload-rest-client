import { CustomEndpoint, createClient } from ".";

// generated from payload

interface Config {
    collections: {
        users: User;
        tags: Tag;
    };
    collectionsJoins: {
        tags: {
            relatedUsers: 'users';
        };
    };
    collectionsSelect: {
        users: UsersSelect<false> | UsersSelect<true>;
        tags: TagsSelect<false> | TagsSelect<true>;
    };
    globals: {
        settings: Settings;
    };
    globalsSelect: {
        settings: SettingsSelect<false> | SettingsSelect<true>;
    };
}

export interface User {
    id: string;
    email: string;
    name: string;
    tags?: (string | Tag)[] | null;
    password?: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Tag {
    id: number;
    name: string;
    relatedUsers?: {
        docs?: (string | User)[] | null;
        hasNextPage?: boolean | null;
    } | null;
    updatedAt: string;
    createdAt: string;
}

export interface Settings {
    id: string;
    test: string;
    updatedAt?: string | null;
    createdAt?: string | null;
}

export interface UsersSelect<T extends boolean = true> {
    updatedAt?: T;
    createdAt?: T;
    email?: T;
    name?: T;
    tags?: T;
    resetPasswordToken?: T;
    resetPasswordExpiration?: T;
    salt?: T;
    hash?: T;
    loginAttempts?: T;
    lockUntil?: T;
}

export interface TagsSelect<T extends boolean = true> {
    name?: T;
    updatedAt?: T;
    createdAt?: T;
}

export interface SettingsSelect<T extends boolean = true> {
    test?: T;
    updatedAt?: T;
    createdAt?: T;
    globalType?: T;
}

// end of generated types

type Locales = "de" | "en";

type CustomEndpoints = {
    greet: CustomEndpoint<{
        params: { name: string };
        query: { locale: Locales };
    }, string>,
};

const client = createClient<Config, Locales, CustomEndpoints>({
    apiUrl: "http://localhost:3000/api",
    cache: "no-store",
    debug: true,
    getAdditionalFetchOptions: (params) => {
        if (params.method === "GET") {
            return {
                next: { tags: [params.slug] },
            };
        }
    },
    customFetchFn: (url, init) => {
        console.log("custom fetch");
        console.log(url, init)

        return fetch(url, init);
    },
    customEndpoints: {
        greet: { method: "GET", path: p => `hello/${p.name}` },
    },
});

const test = async () => {
    // collections

    const users1 = await client.collections.users.find({
        sort: "-email",
        locale: "de",
    });

    console.log("##### all users #####");
    console.log(users1);

    const newUser = await client.collections.users.create({
        doc: { name: "hans", email: "test@test.de", password: "password" },
    });

    console.log("##### new user #####");
    console.log(newUser);

    const updatedUsers = await client.collections.users.update({
        patch: { name: "new name" },
        where: { email: { equals: "test@test.de" } },
    });

    console.log("##### updated users #####");
    console.log(updatedUsers);

    const updatedUser = await client.collections.users.updateById({
        id: newUser.doc.id,
        patch: { name: "next new name" },
    });

    console.log("##### updated user #####");
    console.log(updatedUser);

    const deletedUsers = await client.collections.users.delete({
        where: {
            or: [
                { id: { equals: "foobar" } },
                { email: { equals: "foobar" } },
            ],
        },
    });

    console.log("##### deleted users #####");
    console.log(deletedUsers);

    const deletedUser = await client.collections.users.deleteById({
        id: newUser.doc.id,
    });

    console.log("##### deleted user #####");
    console.log(deletedUser);

    const users2 = await client.collections.users.find();

    console.log("##### all users #####");
    console.log(users2);

    // globals

    const settings = await client.globals.settings.get();

    console.log("##### settings #####");
    console.log(settings);

    const updatedSettings = await client.globals.settings.update({ patch: { test: "hello" } });

    console.log("##### updated settings #####");
    console.log(updatedSettings);

    // others

    const access = await client.access();

    console.log("##### get access config #####");
    console.log(access);

    // custom endpoints

    const greeting = await client.custom.greet({
        params: { name: "John Doe" },
        query: { locale: "en" },
    });

    console.log("##### custom endpoint #####");
    console.log(greeting);
};

test();
