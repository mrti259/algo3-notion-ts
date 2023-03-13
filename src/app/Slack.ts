import { WebClient } from "@slack/web-api";

import { Notificacion } from "./types";

export class Notificador {
  private slack: WebClient;

  constructor(token: string, private default_channel: string) {
    this.slack = new WebClient(token);
  }

  async enviar(notificaciones: Notificacion[]) {
    const usuarios = await this.slack.users.list().then((res) => res.members);
    if (!usuarios) return;
    for (const notificacion of notificaciones) {
      const { destinatario } = notificacion;
      const usuario = usuarios.find(
        (usu) =>
          usu.name === destinatario ||
          usu.real_name === destinatario ||
          usu.profile?.real_name === destinatario ||
          usu.profile?.display_name === destinatario,
      );
      if (usuario && usuario.id) {
        this.enviarMensajesACanal(usuario.id, notificacion.mensaje);
        return;
      }
      const mensaje = `${notificacion.destinatario}: ${notificacion.mensaje}`;
      this.enviarMensajesACanal(this.default_channel, mensaje);
    }
  }

  private async enviarMensajesACanal(channel_id: string, mensaje: string) {
    await this.slack.chat.postMessage({
      channel: channel_id,
      text: mensaje,
    });
  }
}
