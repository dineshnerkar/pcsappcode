const nodemailer = require('nodemailer');

module.exports = () => {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER_NAME,
            pass: process.env.EMAIL_PASSWORD
        },
        requireTLS: true
    });

    async function wrappedSendMail(mailOptions) {
        return new Promise((resolve, reject) => {
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    reject(error);
                }
                else {
                    resolve(info.response);
                }
            });
        });
    }

    function getMailOption(to) {
        let mailOption = {};
        switch (process.env.env) {
            case 'development':
                mailOption = {
                    from: `"printer-app-dev" <${process.env.MAIL_FROM}>`,
                    to: ["vikas@zogato.com", "nupura.deshmukh@impactsystems.com"],
                }
                break;
            case 'test':
                mailOption = {
                    from: `"printer-app-test" <${process.env.MAIL_FROM}>`,
                    to: ["aniket.raje@impactsystems.com", "nupura.deshmukh@impactsystems.com"],
                }
                break;
            case 'demo':
                mailOption = {
                    from: `"printer-app-demo" <${process.env.MAIL_FROM}>`,
                    to: ["aniket.raje@impactsystems.com", "nupura.deshmukh@impactsystems.com"],
                }
                break;
            case 'prod':
                mailOption = {
                    from: `"printer-app" <${process.env.MAIL_FROM}>`,
                    to: to,
                }
                break;
            default:
                mailOption = {
                    from: `"printer-app-default" <${process.env.MAIL_FROM}>`,
                    to: ["aniket.raje@impactsystems.com", "nupura.deshmukh@impactsystems.com"],
                }
                break;
        }
        return mailOption;
    }

    async function recallInit(docs) {
        let re = [];
        for (let i = 0; i < docs.length; i++) {
            const doc = docs[i];
            const to = doc['#recipient'];
            const docId = doc['#printCopyNo'];
            const mailOption = getMailOption(to);
            mailOption.subject = `ReCall-Doc || ${docId}`;
            mailOption.text = `Recall task is pending for Document ${doc['@infocardNumber']} version ${doc['@revision']}\nPlease check the details in PCS inbox.`; 
            const r = await wrappedSendMail(mailOption);
            re.push(r);
        }
        return re;
    }

    async function recallInitMail(req, res, next) {
        const result = await recallInit(req.payload);
        if (result) {
            next();
        }
    }

    return {
        recallInitMail,
        recallInit
    };
};
