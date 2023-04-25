import { WebClient } from "@slack/web-api";
import { Member } from "@slack/web-api/dist/response/UsersListResponse";

import { Notificacion } from "./types";

export class Notificador {
  private slack: WebClient;

  constructor(token: string, private default_channel: string) {
    this.slack = new WebClient(token);
  }

  async enviar(notificaciones: Notificacion[]) {
    const usuarios = await this.slack.users.list().then((res) => res.members);
    if (!usuarios) return;
    await Promise.allSettled(
      notificaciones.map((notificacion) =>
        this.enviarNotificacionEntreUsuarios(notificacion, usuarios),
      ),
    );
  }

  private async enviarNotificacionEntreUsuarios(
    notificacion: Notificacion,
    usuarios: Member[],
  ) {
    const { destinatario, mensaje } = notificacion;
    const usuario = usuarios.find(
      (usu) =>
        usu.name === destinatario ||
        usu.real_name === destinatario ||
        usu.profile?.real_name === destinatario ||
        usu.profile?.display_name === destinatario,
    );
    if (usuario && usuario.id) {
      await this.enviarMensajesACanal(usuario.id, mensaje);
      return;
    }
    const mensajeDeCanal = `${destinatario}: ${mensaje}`;
    await this.enviarMensajesACanal(this.default_channel, mensajeDeCanal);
  }

  private async enviarMensajesACanal(channel_id: string, mensaje: string) {
    await this.slack.chat.postMessage({
      channel: channel_id,
      text: mensaje,
    });
  }
}
