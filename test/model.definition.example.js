const Sequelize = require('sequelize');
const {expect} = require('chai');

describe('Model definition', () => {

    const sequelize = new Sequelize('sequelize_test', 'user', 'password', {
        host: 'localhost',
        dialect: 'mssql'
    });

    after(() => {
        sequelize.close();
    });

    describe('Table mapping', () => {
        it('User model mapped on `users` table by default', async () => {
            try {
                const User = sequelize.define('user', {
                    username: Sequelize.STRING,
                    birthdate: Sequelize.DATE,
                    email: Sequelize.STRING
                });
    
                const userCount = await User.count();
    
                expect.fail('Should not got here.');
            } catch (e) {
                expect(e.message).to.equal('Invalid object name \'users\'.');
            }
        });
    
        it('User model mapped on empty `user` table', async() => {
            const User = sequelize.define('user', {
                username: Sequelize.STRING,
                birthdate: Sequelize.DATE,
                email: Sequelize.STRING
            }, {
                tableName: 'user'
            });
    
            const userCount = await User.count();
    
            expect(userCount).to.equal(0);
        });

    });

    describe('Primary key configuration', () => {
        
        it('Fail to build model for id field not marked as primary key', () => {
            try {
                sequelize.define('user', {
                    id: Sequelize.BIGINT,
                    username: Sequelize.STRING,
                    birthdate: Sequelize.DATE,
                    email: Sequelize.STRING
                });
    
                expect.fail('Should not get here.');
            } catch (e) {
                expect(e.message).to.contain('\'id\'');
                expect(e.message).to.contain('primaryKey:');
            }
        });

        it('Configure User model with `id` property as primary key', async () => {
            const User = sequelize.define('user', {
                id: {type: Sequelize.BIGINT, allowNull: false, primaryKey: true},
                username: Sequelize.STRING,
                birthdate: Sequelize.DATE,
                email: Sequelize.STRING
            }, {
                tableName: 'user'
            });

            const userCount = await User.count();

            expect(userCount).to.equal(0);
        });

    });

    describe('Validation', () => {

        afterEach(async () => {
            await sequelize.query('delete from [user]');
        });

        it('Should not allow null in username', async () => {
            const User = sequelize.define('user', {
                id: {type: Sequelize.BIGINT, allowNull: false, primaryKey: true},
                username: {type: Sequelize.STRING, allowNull: false},
                birthdate: Sequelize.DATE,
                email: Sequelize.STRING
            }, {
                tableName: 'user'
            });

            try {
                await User.create({
                    id: 1,
                    username: null,
                    birthdate: '1999-01-01'
                });
                expect.fail('Should not get here.');
            } catch (e) {
                expect(e.message).to.contain('notNull Violation: user.username cannot be null');
            }
        });

        it('Should not allow numbers in username', async () => {
            const User = sequelize.define('user', {
                id: {type: Sequelize.BIGINT, allowNull: false, primaryKey: true},
                username: {type: Sequelize.STRING, allowNull: false, validate: {is: /^[a-z]+$/i}},
                birthdate: Sequelize.DATE,
                email: Sequelize.STRING
            }, {
                tableName: 'user'
            });

            try {
                await User.create({
                    id: 1,
                    username: 'user1',
                    birthdate: '1999-01-01'
                });

                expect.fail('Should not get here.');
            } catch (e) {
                expect(e.message).to.contain('Validation is on username failed');
            }
        });

        it('Should allow only letters in username', async () => {
            const User = sequelize.define('user', {
                id: {type: Sequelize.BIGINT, allowNull: false, primaryKey: true},
                username: {type: Sequelize.STRING, allowNull: false, validate: {is: /^[a-z]+$/i}},
                birthdate: Sequelize.DATE,
                email: Sequelize.STRING
            }, {
                tableName: 'user',
                timestamps: false
            });

            await User.create({
                id: 1,
                username: 'user',
                birthdate: '1999-01-01'
            });

            expect(await User.count()).to.equal(1);
        });

        it('Should not allow email address that starts not with a first letter in username', async() => {
            const User = sequelize.define('user', {
                id: {type: Sequelize.BIGINT, allowNull: false, primaryKey: true},
                username: {type: Sequelize.STRING, allowNull: false, validate: {is: /^[a-z]+$/i}},
                birthdate: Sequelize.DATE,
                email: Sequelize.STRING
            }, {
                tableName: 'user',
                timestamps: false,
                validate: {
                    theSameStartLetterInUsernameAndEmail: () => {
                        if (this.email && this.email[0].toLowerCase() !== this.username[0].toLowerCase()) {
                            throw new Error(`Email should start with '${this.username[0].toLowerCase()}.`);
                        }
                    }
                }
            });

            try {
                await User.create({
                    id: 1,
                    username: 'user',
                    birthdate: '1999-01-01',
                    email: 'my_email@host.com'
                });
            } catch (e) {
                expect(e.message).to.equal('Email should start with \'u\'.');
            }
        });

        it('Should allow email that starts with the first letter in username', async() => {
            const User = sequelize.define('user', {
                id: {type: Sequelize.BIGINT, allowNull: false, primaryKey: true},
                username: {type: Sequelize.STRING, allowNull: false, validate: {is: /^[a-z]+$/i}},
                birthdate: Sequelize.DATE,
                email: Sequelize.STRING
            }, {
                tableName: 'user',
                timestamps: false,
                validate: {
                    theSameStartLetterInUsernameAndEmail: () => {
                        if (this.email && this.email[0].toLowerCase() !== this.username[0].toLowerCase()) {
                            throw new Error(`Email should start with '${this.username[0].toLowerCase()}.`);
                        }
                    }
                }
            });

            try {
                await User.create({
                    id: 1,
                    username: 'user',
                    birthdate: '1999-01-01',
                    email: 'user_email@host.com'
                });
            } catch (e) {
                expect(e.message).to.equal('Email should start with \'u\'.');
            }
        });

    });

    describe('Timestamp setting', () => {

        const Book = sequelize.define('book', {
            id: {type: Sequelize.BIGINT, allowNull: false, primaryKey: true},
            title: {type: Sequelize.STRING, allowNull: false}
        });

        before(async () => {
            const result = await sequelize.query('SELECT name FROM sys.Tables;');
            
            expect(result[0]).to.have.lengthOf(1);
            expect(result[0][0].name).to.equal('user');

            await Book.sync();

            const postSyncResult = await sequelize.query('SELECT name FROM sys.Tables ORDER BY name');

            expect(postSyncResult[0]).to.have.lengthOf(2);
            expect(postSyncResult[0][0].name).to.equal('books');
        });

        after(async () => {
            const preDropResult = await sequelize.query('SELECT name FROM sys.TABLES');

            expect(preDropResult[0]).to.have.lengthOf(2);

            await Book.drop();

            const postDropResult = await sequelize.query('SELECT name FROM sys.Tables');

            expect(postDropResult[0]).to.have.lengthOf(1);
            expect(postDropResult[0][0].name).to.equal('user');
        });

        afterEach(async () => {
            await Book.destroy({
                where: {
                    id: 1
                }
            });
        });
        
        it('createAt and updatedAt should be automaticaly set up', async () => {
            await Book.create({
                id: 1,
                title: 'Refactoring. Second Edition.'
            });

            const refactoringBook = await Book.findById(1);

            expect(refactoringBook.title).to.equal('Refactoring. Second Edition.');
            expect(refactoringBook.createdAt).to.not.be.null;
            expect(refactoringBook.updatedAt).to.not.be.null;
            expect(refactoringBook.createdAt.toFormat('DD-MM-YYYY HH:MI:SS.LL')).to.equal(refactoringBook.updatedAt.toFormat('DD-MM-YYYY HH:MI:SS.LL'));
            expect(refactoringBook.deletedAt).to.be.undefined;
        });

        it('updateAt should change on update', async () => {
            await Book.create({
                id: 1,
                title: 'Refactoring. Second Edition.'
            });

            const refactoringBook = await Book.findById(1);
            refactoringBook.title = 'Refactoring. Second Edition. Martin Fowler.'
            await refactoringBook.save();

            const updatedBook = await Book.findById(1);

            expect(updatedBook.title).to.equal('Refactoring. Second Edition. Martin Fowler.');
            expect(updatedBook.createdAt).to.not.be.null;
            expect(updatedBook.updatedAt).to.not.be.null;
            expect(updatedBook.createdAt.toFormat('DD-MM-YYYY HH:MI:SS.LL')).to.not.equal(updatedBook.updatedAt.toFormat('DD-MM-YYYY HH:MI:SS.LL'));
            expect(updatedBook.deletedAt).to.be.undefined;
        });

    });

    describe('Paranoid option', () => {
        const Book = sequelize.define('book', {
            id: {type: Sequelize.BIGINT, allowNull: false, primaryKey: true},
            title: {type: Sequelize.STRING, allowNull: false}
        }, {
            paranoid: true
        });

        before(async () => {
            await Book.sync();
        });

        after(async () => {
            await Book.drop();
        });

        afterEach(async () => {
            Book.destroy({
                force: true,
                where: {
                    id: 1
                }
            });
        });

        it('Book should not be deleted by calling destroy method', async () => {
            const refactoring = await Book.create({
                id: 1,
                title: 'Refactoring. Second Edition.'
            });

            await refactoring.destroy();
            const booksNumber = await Book.count();

            expect(booksNumber).to.equal(0);

            const realRecordsNumber = await sequelize.query('SELECT count(*) as cnt FROM books', {type: Sequelize.QueryTypes.SELECT});

            expect(realRecordsNumber[0].cnt).to.equal(1);
        });

        it('Book should be deleted by calling destroy method with force parameter set to true', async () => {
            const refactoring = await Book.create({
                id: 1,
                title: 'Refactoring. Second Edition.'
            });

            await refactoring.destroy({force: true});

            const realRecordsNumber = await sequelize.query('SELECT count(*) as cnt FROM books', {type: Sequelize.QueryTypes.SELECT});

            expect(realRecordsNumber[0].cnt).to.equal(0);
        });

    });

});
