const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Terms = require('../helpers/config');
const models = require('../models');
const fs = require('fs');

const {
    User,
    UserRole,
    RoleType,
    Role,
    Link,
    Privilege,
    RootRole,
    SystemComponent,
    SystemLink,
    SystemApi,
    Configuration
} = models;

require('dotenv').config();

const initDB = async () => {
    console.log("Starting init database. Please wait ...\n\n");

    /**
     * 1. Tạo kết nối đến cơ sở dữ liệu
     */
    let connectOptions = process.env.DB_AUTHENTICATION === 'true' ?
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            user: process.env.DB_USERNAME,
            pass: process.env.DB_PASSWORD,
            auth: {
                authSource: 'admin'
            }
        } : {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }

    console.log(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT || "27017"}/${process.env.DB_NAME}`)
    const systemDB = await mongoose.createConnection(
        `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT || "27017"}/${process.env.DB_NAME}`,
        connectOptions
    );
    console.log('connectOptions', systemDB);
    if (!systemDB) throw ('Error! Cannot connect to MongoDB. Please check connection. :(');

    /**
     * 2. Xóa dữ liệu db cũ và khởi tạo dữ liệu config 
     */
    systemDB.dropDatabase();
    console.log("@Setup new database.");

    await Configuration(systemDB).insertMany([
        {
            name: 'all',
            backup: {
                time: {
                    second: '0',
                    minute: '0',
                    hour: '2',
                    date: '1',
                    month: '*',
                    day: '*'
                },
                limit: 10
            }
        }
    ]);
    console.log("@Initial configuration complete.");

    /**
     * 3. Tạo các Role Type
     */
    const roleType = await RoleType(systemDB).insertMany([
        { name: Terms.ROLE_TYPES.ROOT },
        { name: Terms.ROLE_TYPES.POSITION },
        { name: Terms.ROLE_TYPES.COMPANY_DEFINED }
    ]);
    console.log("@Created ROLETYPE.");


    /**
     * 4. Tạo tài khoản system admin
     */
    const salt = await bcrypt.genSaltSync(10);
    const hash = await bcrypt.hashSync(process.env.SYSTEM_ADMIN_PASSWORD, salt);
    const systemAdmin = await User(systemDB).create({
        name: process.env.SYSTEM_ADMIN_NAME,
        email: process.env.SYSTEM_ADMIN_EMAIL,
        password: hash
    });
    const roleAbstract = await RoleType(systemDB).findOne({ name: Terms.ROLE_TYPES.ROOT });
    const roleSystemAdmin = await Role(systemDB).create({ // Tạo role System Admin
        name: Terms.ROOT_ROLES.SYSTEM_ADMIN.name,
        type: roleAbstract._id
    });
    await UserRole(systemDB).create({ userId: systemAdmin._id, roleId: roleSystemAdmin._id });
    console.log("@Created SUPER ADMIN account.");

    /**
     * 5. Tạo các link và phân quyền truy cập cho system-admin
     */
    const links = await Link(systemDB).insertMany([
        {
            url: '/home',
            description: 'Trang chủ hệ thống quản lý doanh nghiệp',
            deleteSoft: false
        },
        {
            url: '/system/settings',
            description: 'Quản lý thiết lập hệ thống',
            deleteSoft: false
        },
        {
            url: '/system/companies-management',
            description: 'Quản lý các doanh nghiệp đăng ký sử dụng dịch vụ',
            deleteSoft: false
        },
        {
            url: '/system/links-default-management',
            description: 'Quản lý các trang mặc định khi khởi tạo 1 công ty',
            deleteSoft: false
        },
        {
            url: '/system/apis-default-management',
            description: 'Quản lý các API của hệ thống',
            deleteSoft: false
        },
        {
            url: '/system/privilege-api-management',
            description: 'Quản lý các phân quyền API của hệ thống',
            deleteSoft: false
        },
        {
            url: '/system/components-default-management',
            description: 'Quản lý các thành phần UI mặc định khi khởi tạo cho 1 công ty',
            deleteSoft: false
        },
        {
            url: '/system/roles-default-management',
            description: 'Thông tin về các role default trong csdl',
            deleteSoft: false
        },
        {
            url: '/system/manage-system-admin-page',
            description: 'Quản lý trang quản trị hệ thống',
            deleteSoft: false
        }
    ]);
    console.log("@Created LINKS.");

    await Privilege(systemDB).insertMany([
        {
            resourceId: links[0]._id,
            resourceType: 'Link',
            roleId: roleSystemAdmin._id
        }, {
            resourceId: links[1]._id,
            resourceType: 'Link',
            roleId: roleSystemAdmin._id
        }, {
            resourceId: links[2]._id,
            resourceType: 'Link',
            roleId: roleSystemAdmin._id
        }, {
            resourceId: links[3]._id,
            resourceType: 'Link',
            roleId: roleSystemAdmin._id
        }, {
            resourceId: links[4]._id,
            resourceType: 'Link',
            roleId: roleSystemAdmin._id
        }, {
            resourceId: links[5]._id,
            resourceType: 'Link',
            roleId: roleSystemAdmin._id
        }
        , {
            resourceId: links[6]._id,
            resourceType: 'Link',
            roleId: roleSystemAdmin._id
        }
        , {
            resourceId: links[7]._id,
            resourceType: 'Link',
            roleId: roleSystemAdmin._id
        }
        , {
            resourceId: links[8]._id,
            resourceType: 'Link',
            roleId: roleSystemAdmin._id
        }
    ]);


    /**
     * 6. Tạo các RootRole
     */
    const roleSuperAdmin = await RootRole(systemDB).create({
        name: Terms.ROOT_ROLES.SUPER_ADMIN.name,
        description: Terms.ROOT_ROLES.SUPER_ADMIN.description
    });
    const roleAdmin = await RootRole(systemDB).create({
        name: Terms.ROOT_ROLES.ADMIN.name,
        description: Terms.ROOT_ROLES.ADMIN.description
    });
    const roleManager = await RootRole(systemDB).create({
        name: Terms.ROOT_ROLES.MANAGER.name,
        description: Terms.ROOT_ROLES.MANAGER.description
    });
    const roleDeputyManager = await RootRole(systemDB).create({
        name: Terms.ROOT_ROLES.DEPUTY_MANAGER.name,
        description: Terms.ROOT_ROLES.DEPUTY_MANAGER.description
    });
    const roleEmployee = await RootRole(systemDB).create({
        name: Terms.ROOT_ROLES.EMPLOYEE.name,
        description: Terms.ROOT_ROLES.EMPLOYEE.description
    });
    console.log("@Created ROOTROLES.");

    /**
     * 7. Khởi tạo các system-link và system-component
     */
    const convertRoleNameToRoleId = (roleName) => { // Tạo nhanh hàm tiện ích chuyển đổi tên role thành id role
        if (roleName === Terms.ROOT_ROLES.SUPER_ADMIN.name) {
            return roleSuperAdmin._id;
        } else if (roleName === Terms.ROOT_ROLES.ADMIN.name) {
            return roleAdmin._id;
        } else if (roleName === Terms.ROOT_ROLES.MANAGER.name) {
            return roleManager._id;
        } else if (roleName === Terms.ROOT_ROLES.DEPUTY_MANAGER.name) {
            return roleDeputyManager._id;
        } else if (roleName === Terms.ROOT_ROLES.EMPLOYEE.name) {
            return roleEmployee._id;
        }
    }

    const convertComponentNameToId = (componentName, systemComponents) => {
        let id = null;
        for (let i = 0; i < systemComponents.length; i++) {
            if (componentName === systemComponents[i].name) {
                id = systemComponents[i]._id;
                break;
            }
        }

        return id;
    }

    const getComponentDataByName = (name, componentArr) => {
        let component = null;
        for (let i = 0; i < componentArr.length; i++) {
            if (name === componentArr[i].name) {
                component = componentArr[i];
                break;
            }
        }
        return component;
    }

    const convertLinkUrltoLinkId = (linkUrl, systemLinks) => {
        let id = null;
        for (let i = 0; i < systemLinks.length; i++) {
            if (linkUrl === systemLinks[i].url) {
                id = systemLinks[i]._id;
                break;
            }
        }

        return id;
    }

    // Tạo các system component
    const dataSystemComponents = Terms.COMPONENTS.map(component => {
        return {
            name: component.name,
            roles: component.roles.map(name => convertRoleNameToRoleId(name)),
            description: component.description
        }
    });
    const systemComponents = await SystemComponent(systemDB).insertMany(dataSystemComponents);

    // Tạo các system link
    const dataSystemLinks = Terms.LINKS.map(systemLink => {
        return {
            ...systemLink,
            roles: systemLink.roles.map(name => convertRoleNameToRoleId(name)),
            components: systemLink.components ? systemLink.components.map(name => convertComponentNameToId(name, systemComponents)) : []
        }
    })
    let systemLinks = await SystemLink(systemDB).insertMany(dataSystemLinks);

    // Tạo system api
    let rawdata = fs.readFileSync('middleware/systemApi.json');
    let systemApis = JSON.parse(rawdata);
    await SystemApi(systemDB).insertMany(systemApis);


    // Thêm lại dữ liệu các links cho component
    for (let i = 0; i < systemComponents.length; i++) {
        let curSysComponent = await SystemComponent(systemDB).findById(systemComponents[i]._id);
        let dataComponent = getComponentDataByName(curSysComponent.name, Terms.COMPONENTS);
        curSysComponent.links = dataComponent.links.map(linkUrl => convertLinkUrltoLinkId(linkUrl, systemLinks));
        await curSysComponent.save();
    }
    console.log("@Created COMPONENTS.");

    /**
     * . Đóng kết nối với database
     */
    systemDB.close();

    console.log("\n\nDone. Initial database successfully.");
}

initDB().catch(err => {
    console.log(err);
    process.exit(0)
});