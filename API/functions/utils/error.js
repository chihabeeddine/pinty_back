//=======================================================================//
//     ERROR functions                                                   //
//=======================================================================//

module.exports = {
  page404: (req, res) =>
    res
      .status(404)
      .send(
        `[${config.env.toUpperCase()}] Olala t'es perdu, tu devrais aller ici mec : <a href="https://pinty.gitbook.io/backend">https://pinty.gitbook.io/backend</a>`,
      ),
};
