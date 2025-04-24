const db = require("../models");
const Donation = db.donation;
const User = db.user;

exports.makeDonation = async (req, res) => {
  try {
    const { amount, email, name, message, is_anonymous } = req.body;

    if (!amount || amount <= 0) {
      return res
        .status(400)
        .send({ message: "Donation amount must be positive." });
    }

    // For logged in users
    let userId = null;
    if (req.userId && !is_anonymous) {
      userId = req.userId;
    }

    // For anonymous donations, email is required
    if (is_anonymous && !email) {
      return res
        .status(400)
        .send({ message: "Email is required for anonymous donations." });
    }

    // In a real app, payment processing would happen here

    // Create donation record
    const donation = await Donation.create({
      amount: amount,
      user_id: userId,
      email: email || null,
      name: name || null,
      message: message || null,
      is_anonymous: is_anonymous || false,
    });

    res.status(201).send({
      message: "Thank you for your donation!",
      donation: donation,
    });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};

exports.getRecentDonations = async (req, res) => {
  try {
    const donations = await Donation.findAll({
      limit: 10,
      order: [["created_at", "DESC"]],
      include: [
        {
          model: User,
          attributes: ["id", "username", "full_name"],
          required: false,
        },
      ],
    });

    // Format for display - hide email info for privacy
    const formattedDonations = donations.map((donation) => {
      return {
        id: donation.id,
        amount: donation.amount,
        name: donation.is_anonymous
          ? "Anonymous"
          : donation.name ||
            (donation.user ? donation.user.full_name : "Unknown"),
        message: donation.message,
        created_at: donation.created_at,
      };
    });

    res.status(200).send(formattedDonations);
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
};
